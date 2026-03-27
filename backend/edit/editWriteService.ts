import prisma, { getPrismaModel } from "@/database/prisma";
import { operation_type, user_role_type } from "@/shared/enums";
import { contentResponse } from "@/shared/serviceResponse";
import { slugifyForUrl } from "@/shared/utilities";
import { SessionUser } from "next-auth";
import { validateRoleAtLeast } from "../actionHelper";
import {
  DeleteChildAction,
  FieldCms,
  ImageFieldCms,
  isFieldEmpty,
  MappingFieldCms,
  SlugFieldCms,
  TableCms,
} from "../cms/cmsTypes";
import sketchDatabaseCms from "../cms/sketchDatabaseCms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxClient = any;

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

/** Perserves type information in the result */
function isMappingField(e: FieldCms): e is MappingFieldCms {
  return e.type === "mapping";
}

Object.keys(sketchDatabaseCms).forEach((table) => {
  allowedColumnsByTable[table] = sketchDatabaseCms[table].fields
    .filter((field) => field.column)
    .map((field) => field.column!);

  allowedMappingsByTable[table] = sketchDatabaseCms[table].fields
    .filter(isMappingField)
    .map((field) => field.mappingTable.name);
});

/** Write field values to the database
 * @param table The orm from the client, don't trust it
 */
export async function writeFieldValues(
  user: SessionUser,
  table: TableCms,
  id: number,
) {
  validateRoleAtLeast(user.role, user_role_type.Editor);

  // Verify table is allowed to be edited
  const allowedColumns = allowedColumnsByTable[table.name];

  if (!allowedColumns) {
    throw new Error(`Table ${table.name} not allowed`);
  }

  // Sanitization
  const operation = id ? operation_type.UPDATE : operation_type.INSERT;
  const newSlug = updateSlugs(table);

  if (operation == operation_type.UPDATE) {
    removeUnmodifiedFields(table);
  }

  sanitizeListFields(table.fields);

  // Validation
  validateRequiredFields(table.fields, operation);

  // Write all changes in a transaction so partial failures roll back
  const rowId = await prisma.$transaction(async (tx: TxClient) => {
    const txRowId = await writeFieldChanges(
      tx,
      user.id,
      table.name,
      id,
      table.fields,
      0,
    );

    await writeMappingChanges(tx, user.id, table, txRowId);

    // Create audit record
    await tx.audit.create({
      data: {
        changed_by_id: user.id,
        operation,
        table_name: table.name,
        row_id: txRowId.toString(),
        modified_fields: table.fields,
      },
    });

    return txRowId;
  });

  return contentResponse({ rowId, newSlug });
}

/** Filter out empty list values */
function sanitizeListFields(fields: FieldCms[]) {
  for (const field of fields) {
    if (field.type == "list") {
      if (field.values) {
        for (let i = 0; i < field.values.length; i++) {
          field.values[i] = field.values[i]?.filter((v) => v) || null;
        }
      }
    }
  }
}

function validateRequiredFields(fields: FieldCms[], operation: operation_type) {
  const errors: string[] = [];

  for (const field of fields) {
    if (field.column) {
      if (
        !field.optional &&
        isFieldEmpty(field, 0) &&
        (field.modified?.[0] || operation == operation_type.INSERT)
      ) {
        errors.push(`Field '${field.column}' is required`);
      }
    }
    if (field.type == "mapping") {
      const rowCount = field.mappingTable.ids?.length || 0;

      for (const mappedField of field.mappingTable.fields) {
        for (let i = 0; i < rowCount; i++) {
          if (!mappedField.values || mappedField.values.length < rowCount) {
            errors.push(`${field.label}: Row ${i + 1}: No data`);
          } else if (
            !mappedField.optional &&
            isFieldEmpty(mappedField, i) &&
            mappedField.modified?.[i]
          ) {
            errors.push(
              `${field.label}: Row ${i + 1}: Field '${mappedField.column}' is required`,
            );
          }
        }
      }
    }
  }

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
}

/**
 * Filter unmodified fields because we're going to save this object to the database
 * as an audit of what changed, as well as use it to 'replay' changes from db checkpoints if needed
 */
function removeUnmodifiedFields(table: TableCms) {
  table.fields = table.fields.filter(
    (field) => field.modified?.[0] || field.type == "mapping",
  );

  const mappingFields = table.fields.filter(isMappingField);

  for (const field of mappingFields) {
    const mappingTable = field.mappingTable;
    const mappingTableIds = mappingTable.ids || [];

    // Filter any mapping fields that have no modifications
    mappingTable.fields = mappingTable.fields.filter((f) =>
      f.modified?.some((modified, i) => modified || mappingTableIds[i] < 0),
    );

    // Null out unmodified fields
    mappingTable.fields.forEach((f) => {
      f.values = f.values?.map((value, i) =>
        f.modified?.[i] || mappingTableIds[i] < 0 ? value : null,
      ) as typeof f.values;
    });

    // Remove mapping field if there are no changes
    if (
      !mappingTable.fields.length &&
      !mappingTable.removeIds?.length &&
      !mappingTable.resequence
    ) {
      table.fields = table.fields.filter((f) => f !== field);
    }
  }
}

function updateSlugs(table: TableCms) {
  const slugField = table.fields.find((f) => f.type == "slug") as SlugFieldCms;
  if (!slugField) {
    return;
  }

  const derivedFromField = table.fields.find(
    (f) => f.column == slugField.derivedFrom,
  );

  // If derivedFromField is not found or no change, then don't update the slug
  if (!derivedFromField?.values?.[0] || !derivedFromField?.modified?.[0]) {
    slugField.modified = [false];
    return;
  }

  const newSlug = slugifyForUrl(derivedFromField.values[0].toString());

  slugField.values = [];
  slugField.values[0] = newSlug;
  slugField.modified = [true];

  return newSlug;
}

async function writeFieldChanges(
  tx: TxClient,
  userid: string,
  tableName: string,
  rowId: number,
  fields: FieldCms[],
  index: number,
  mappingTableRelation?: object,
) {
  const dataParams: Record<string, unknown> = {};

  const columnFields = fields.filter((field) => field.column);

  for (const field of columnFields) {
    // TODO: Validate columns are in master config for fields and lookups
    /* if (!allowedColumns.includes(field.column!)) {
        throw new Error(`Column ${field.column} not allowed`);
      }*/
    if (field.modified?.[index]) {
      if (field.type == "image") {
        await writeImageField(tx, field, index, userid, dataParams);
      } else {
        dataParams[field.column!] = field.values![index];
      }
    }
  }

  dataParams["modified_by_id"] = userid;
  dataParams["modified_at"] = new Date();

  // This code would set NeedsReview on any human edited change, requiring review by someone else
  // Now we assume human edits are implicitly reviewed (dont change review status) and AI edits need review
  /*if (!mappingTableRelation) {
    dataParams["review_status"] = review_status_type.NeedsReview;
  }*/

  if (mappingTableRelation) {
    dataParams["sequence"] = index;
  }

  const model = getPrismaModel(tableName, tx);

  // Update row
  if (rowId && rowId >= 0) {
    await model.update({
      where: {
        id: rowId,
        ...(mappingTableRelation ? mappingTableRelation : {}),
      },
      data: dataParams,
    });
    return rowId;
  }
  // Create row
  else {
    // add table relation to data params
    if (mappingTableRelation) {
      Object.assign(dataParams, mappingTableRelation);
    }

    dataParams["created_by_id"] = userid;
    dataParams["created_at"] = new Date();

    const createdRow = await model.create({
      data: dataParams,
    });

    return createdRow.id as number;
  }
}

async function writeImageField(
  tx: TxClient,
  field: ImageFieldCms,
  index: number,
  userid: string,
  dataParams: Record<string, unknown>,
) {
  if (!field.column || !field.navProp) {
    throw new Error("Image field missing column or navProp");
  }

  // Create and attach the image
  const imageCdnkey = field.values?.[index];

  if (imageCdnkey) {
    // Prisma updates either need to be all id based or navigation property based, can't mix
    // modified_by_id is id based, so we need to set the image by id as well, so create and get the id

    const imageRecord = await tx.image.create({
      data: {
        cdn_key: imageCdnkey,
        created_by_id: userid,
      },
    });

    dataParams[field.column] = imageRecord.id;
  }
  // Else remove the image association, mark the image as inactive
  else {
    dataParams[field.column] = null;
  }
}

async function writeMappingChanges(
  tx: TxClient,
  userid: string,
  table: TableCms,
  id: number,
) {
  /** Protects from CRUD'ing rows not mapped to the row ID that the API call is updating */
  const tableRelation = {
    [table.name + "_id"]: id,
  };

  for (const field of table.fields) {
    if (field.type != "mapping") {
      continue;
    }

    if (!id || id <= 0) {
      throw new Error("Create entry before mapping data to it");
    }

    const mappingTable = field.mappingTable;

    if (!allowedMappingsByTable[table.name].includes(mappingTable.name)) {
      throw new Error(`Edit mapping on ${mappingTable?.name} not allowed`);
    }

    for (const removedId of mappingTable.removeIds || []) {
      // Delete
      await getPrismaModel(mappingTable.name, tx).delete({
        where: {
          id: removedId,
          ...tableRelation,
        },
      });
    }

    // For each id/row
    let index = 0;
    for (const mappingId of mappingTable.ids || []) {
      if (
        mappingId < 0 ||
        mappingTable.resequence ||
        mappingTable.fields.some((field) => field.modified?.[index])
      ) {
        await writeFieldChanges(
          tx,
          userid,
          mappingTable.name,
          mappingId,
          mappingTable.fields,
          index,
          tableRelation,
        );
      }
      index++;
    }
  }
}

export async function getSlugForId(table: TableCms, id: number) {
  const slugField = table.fields.find((f) => f.type == "slug") as SlugFieldCms;
  if (!slugField || !slugField.column) {
    throw new Error("Table does not have a slug field or it is not configured");
  }

  const row = await getPrismaModel(table.name).findUnique({
    where: {
      id,
    },
    select: {
      [slugField.column]: true,
    },
  });

  return row?.[slugField.column] as string | undefined;
}

async function deleteChildren(
  tx: TxClient,
  fkColumn: string,
  rowId: number,
  children: DeleteChildAction[],
) {
  for (const child of children) {
    if (child.children?.length) {
      // Find child row IDs so we can clean up grandchildren first
      const childFkColumn = child.table + "_id";
      const childRows = await getPrismaModel(child.table, tx).findMany({
        where: { [fkColumn]: rowId },
        select: { id: true },
      });
      for (const childRow of childRows) {
        await deleteChildren(
          tx,
          childFkColumn,
          childRow.id as number,
          child.children,
        );
      }
    }

    if (child.action === "delete") {
      await getPrismaModel(child.table, tx).deleteMany({
        where: { [fkColumn]: rowId },
      });
    } else if (child.action === "nullify") {
      await getPrismaModel(child.table, tx).updateMany({
        where: { [fkColumn]: rowId },
        data: { [fkColumn]: null },
      });
    }
  }
}

export async function deleteRow(
  user: SessionUser,
  table: TableCms,
  rowId: number,
) {
  // Allow the user that created the row to delete, otherwise it must be a mod
  const row = await getPrismaModel(table.name).findUnique({
    where: {
      id: rowId,
    },
    select: {
      created_by_id: true,
    },
  });

  validateRoleAtLeast(
    user.role,
    (row?.created_by_id as string) == user.id
      ? user_role_type.Editor
      : user_role_type.Moderator,
  );

  const fkColumn = table.name + "_id";

  // Look up the master CMS definition to find the table's mapping fields
  const masterTable = sketchDatabaseCms[table.name];

  await prisma.$transaction(async (tx: TxClient) => {
    // Delete CMS mapping table children
    if (masterTable) {
      for (const field of masterTable.fields) {
        if (field.type === "mapping") {
          await getPrismaModel(field.mappingTable.name, tx).deleteMany({
            where: { [fkColumn]: rowId },
          });
        }
      }
    }

    // Handle non-mapping child tables
    await deleteChildren(tx, fkColumn, rowId, table.deleteChildren || []);

    // Delete the row
    await getPrismaModel(table.name, tx).delete({
      where: { id: rowId },
    });

    // Create audit record
    await tx.audit.create({
      data: {
        changed_by_id: user.id,
        operation: operation_type.DELETE,
        table_name: table.name,
        row_id: rowId.toString(),
      },
    });
  });
}
