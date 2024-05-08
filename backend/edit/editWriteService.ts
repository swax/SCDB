import prisma from "@/database/prisma";
import { contentResponse } from "@/shared/serviceResponse";
import { slugifyForUrl } from "@/shared/stringUtils";
import {
  operation_type,
  review_status_type,
  user_role_type,
} from "@prisma/client";
import {
  FieldOrm,
  ImageFieldOrm,
  MappingEditField,
  SlugFieldOrm,
  TableOrm,
} from "../../database/orm/ormTypes";
import sketchDatabaseOrm from "../../database/orm/sketchDatabaseOrm";
import { validateRoleAtLeast } from "../actionHelper";
import { SessionUser } from "next-auth";

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

/** Perserves type information in the result */
function isMappingField(e: FieldOrm): e is MappingEditField {
  return e.type === "mapping";
}

Object.keys(sketchDatabaseOrm).forEach((table) => {
  allowedColumnsByTable[table] = sketchDatabaseOrm[table].fields
    .filter((field) => field.column)
    .map((field) => field.column!);

  allowedMappingsByTable[table] = sketchDatabaseOrm[table].fields
    .filter(isMappingField)
    .map((field) => field.mappingTable.name);
});

/** Write field values to the database
 * @param table The orm from the client, don't trust it
 */
export async function writeFieldValues(
  user: SessionUser,
  table: TableOrm,
  id: number,
) {
  validateRoleAtLeast(user.role, user_role_type.Editor);

  // Verify table is allowed to be edited
  const allowedColumns = allowedColumnsByTable[table.name];

  if (!allowedColumns) {
    throw `Table ${table.name} not allowed`;
  }

  updateSlugs(table);
  removeUnmodifiedFields(table);

  validateRequiredFields(table.fields);

  const rowId = await writeFieldChanges(
    user.id,
    table.name,
    id,
    table.fields,
    0,
  );

  await writeMappingChanges(user.id, table, rowId);

  await prisma.audit.create({
    data: {
      changed_by_id: user.id,
      operation: id ? operation_type.UPDATE : operation_type.INSERT,
      table_name: table.name,
      row_id: rowId.toString(),
      modified_fields: table.fields,
    },
  });

  return contentResponse(rowId);
}

function validateRequiredFields(fields: FieldOrm[]) {
  const errors: string[] = [];

  for (const field of fields) {
    if (field.column) {
      if (!field.optional && !field.values?.[0]) {
        errors.push(`Field '${field.column}' is required`);
      }
    }
    if (field.type == "mapping") {
      const rowCount = field.mappingTable.ids?.length || 0;

      for (const mappedField of field.mappingTable.fields) {
        for (let i = 0; i < rowCount; i++) {
          if (!mappedField.values || mappedField.values.length < rowCount) {
            errors.push(`${field.label}: Row ${i + 1}: No data`);
          } else if (!mappedField.optional && !mappedField.values[i]) {
            errors.push(
              `${field.label}: Row ${i + 1}: Field '${mappedField.column}' is required`,
            );
          }
        }
      }
    }
  }

  if (errors.length) {
    throw errors.join("\n");
  }
}

/**
 * Filter unmodified fields because we're going to save this object to the database
 * as an audit of what changed, as well as use it to 'replay' changes from db checkpoints if needed
 */
function removeUnmodifiedFields(table: TableOrm) {
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

    if (!mappingTable.fields.length && !mappingTable.removeIds?.length) {
      table.fields = table.fields.filter((f) => f !== field);
    }
  }
}

function updateSlugs(table: TableOrm) {
  const slugField = table.fields.find((f) => f.type == "slug") as SlugFieldOrm;
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

  slugField.values = [];
  slugField.values[0] = slugifyForUrl(derivedFromField.values[0].toString());
  slugField.modified = [true];
}

async function writeFieldChanges(
  userid: string,
  tableName: string,
  rowId: number,
  fields: FieldOrm[],
  index: number,
  mappingTableRelation?: object,
) {
  const dataParams: any = {};

  const columnFields = fields.filter((field) => field.column);

  for (let field of columnFields) {
    // TODO: Validate columns are in master config for fields and lookups
    /* if (!allowedColumns.includes(field.column!)) {
        throw new Error(`Column ${field.column} not allowed`);
      }*/
    if (field.type == "image") {
      await writeImageField(field, index, userid, dataParams);
    } else {
      dataParams[field.column!] = field.values![index];
    }
  }

  const dynamicPrisma = prisma as any;

  dataParams["modified_by_id"] = userid;
  dataParams["modified_at"] = new Date();

  // Only flag the root as needs review
  if (!mappingTableRelation) {
    dataParams["review_status"] = review_status_type.NeedsReview;
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
  field: ImageFieldOrm,
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
  table: TableOrm,
  id: number,
) {
  const dynamicPrisma = prisma as any;

  /** Protects from CRUD'ing rows not mapped to the row ID that the API call is updating */
  const tableRelation = {
    [table.name + "_id"]: id,
  };

  for (let field of table.fields) {
    if (field.type != "mapping") {
      continue;
    }

    const mappingTable = field.mappingTable;

    if (!allowedMappingsByTable[table.name].includes(mappingTable.name)) {
      throw new Error(`Edit mapping on ${mappingTable?.name} not allowed`);
    }

    for (let removedId of mappingTable.removeIds || []) {
      // Delete
      await dynamicPrisma[mappingTable.name].delete({
        where: {
          id: removedId,
          ...tableRelation,
        },
      });
    }

    let index = 0;
    for (let mappingId of mappingTable.ids || []) {
      if (
        mappingId < 0 ||
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

export async function deleteRow(
  user: SessionUser,
  table: TableOrm,
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
