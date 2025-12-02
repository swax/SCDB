import prisma from "@/database/prisma";
import { contentResponse } from "@/shared/serviceResponse";
import { slugifyForUrl } from "@/shared/utilities";
import {
  operation_type,
  review_status_type,
  user_role_type,
} from "@/shared/enums";
import {
  FieldCms,
  ImageFieldCms,
  isFieldEmpty,
  MappingFieldCms,
  SlugFieldCms,
  TableCms,
} from "../cms/cmsTypes";
import sketchDatabaseCms from "../cms/sketchDatabaseCms";
import { validateRoleAtLeast } from "../actionHelper";
import { SessionUser } from "next-auth";

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

  // Write the changes
  const rowId = await writeFieldChanges(
    user.id,
    table.name,
    id,
    table.fields,
    0,
  );

  await writeMappingChanges(user.id, table, rowId);

  // Create audit record
  await prisma.audit.create({
    data: {
      changed_by_id: user.id,
      operation,
      table_name: table.name,
      row_id: rowId.toString(),
      modified_fields: table.fields,
    },
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
      f.values = <any>(
        f.values?.map((value, i) =>
          f.modified?.[i] || mappingTableIds[i] < 0 ? value : null,
        )
      );
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
  userid: string,
  tableName: string,
  rowId: number,
  fields: FieldCms[],
  index: number,
  mappingTableRelation?: object,
) {
  const dataParams: any = {};

  const columnFields = fields.filter((field) => field.column);

  for (const field of columnFields) {
    // TODO: Validate columns are in master config for fields and lookups
    /* if (!allowedColumns.includes(field.column!)) {
        throw new Error(`Column ${field.column} not allowed`);
      }*/
    if (field.modified?.[index]) {
      if (field.type == "image") {
        await writeImageField(field, index, userid, dataParams);
      } else {
        dataParams[field.column!] = field.values![index];
      }
    }
  }

  const dynamicPrisma = prisma as any;

  dataParams["modified_by_id"] = userid;
  dataParams["modified_at"] = new Date();

  // Only flag the root as needs review
  if (!mappingTableRelation) {
    dataParams["review_status"] = review_status_type.NeedsReview;
  } else {
    dataParams["sequence"] = index;
  }

  // Update row
  if (rowId && rowId >= 0) {
    await dynamicPrisma[tableName].update({
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

    const createdRow = await dynamicPrisma[tableName].create({
      data: dataParams,
    });

    return createdRow.id as number;
  }
}

async function writeImageField(
  field: ImageFieldCms,
  index: number,
  userid: string,
  dataParams: any,
) {
  if (!field.column || !field.navProp) {
    throw new Error("Image field missing column or navProp");
  }

  // Create and attach the image
  const imageCdnkey = field.values?.[index];

  if (imageCdnkey) {
    // Prisma updates either need to be all id based or navigation property based, can't mix
    // modified_by_id is id based, so we need to set the image by id as well, so create and get the id

    const imageRecord = await prisma.image.create({
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
  userid: string,
  table: TableCms,
  id: number,
) {
  const dynamicPrisma = prisma as any;

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
      await dynamicPrisma[mappingTable.name].delete({
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

  const dynamicPrisma = prisma as any;

  const row = await dynamicPrisma[table.name].findUnique({
    where: {
      id,
    },
    select: {
      [slugField.column]: true,
    },
  });

  return row?.[slugField.column] as string | undefined;
}

export async function deleteRow(
  user: SessionUser,
  table: TableCms,
  rowId: number,
) {
  const dynamicPrisma = prisma as any;

  // Allow the user that created the row to delete, otherwise it must be a mod
  const row = await dynamicPrisma[table.name].findUnique({
    where: {
      id: rowId,
    },
    select: {
      created_by_id: true,
    },
  });

  validateRoleAtLeast(
    user.role,
    row.created_by_id == user.id
      ? user_role_type.Editor
      : user_role_type.Moderator,
  );

  // Perform the delete
  await dynamicPrisma[table.name].delete({
    where: {
      id: rowId,
    },
  });

  await prisma.audit.create({
    data: {
      changed_by_id: user.id,
      operation: operation_type.DELETE,
      table_name: table.name,
      row_id: rowId.toString(),
    },
  });
}
