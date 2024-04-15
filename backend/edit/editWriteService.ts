import prisma from "@/database/prisma";
import { slugifyForUrl } from "@/shared/string";
import sketchDatabaseOrm from "../../database/orm/sketchDatabaseOrm";
import {
  FieldOrm,
  MappingEditField,
  TableOrm,
} from "../../database/orm/ormTypes";

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

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
export async function writeFieldValues(table: TableOrm, id: number) {
  // Verify table is allowed to be edited
  const allowedColumns = allowedColumnsByTable[table.name];

  if (!allowedColumns) {
    throw new Error(`Table ${table.name} not allowed`);
  }

  validateRequiredFields(table.fields);

  const rowId = await writeFieldChanges(table.name, id, table.fields, 0, {});

  await writeMappingChanges(table.name, rowId, table.fields);

  // TODO: Write audit record

  return rowId;
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
    throw new Error(errors.join("\n"));
  }
}

async function writeFieldChanges(
  table: string,
  id: number,
  fields: FieldOrm[],
  index: number,
  tableRelation: object,
) {
  const dataParams: any = {};

  fields
    .filter(
      (field) =>
        field.column && (field.modified?.[index] || field.type == "slug"),
    )
    .forEach((field) => {
      // TODO: Validate columns are in master config for fields and lookups
      /* if (!allowedColumns.includes(field.column!)) {
        throw new Error(`Column ${field.column} not allowed`);
      }*/
      if (field.type == "image") {
        if (!field.column || !field.navProp) {
          throw new Error("Image field missing column or navProp");
        }
        if (field.values && field.values[index]) {
          dataParams[field.navProp] = {
            create: {
              url: field.values[index],
            },
          };
        } else {
          dataParams[field.column] = null;
        }
      } else if (field.type == "slug") {
        const columnValueToSlugify = dataParams[field.derivedFrom];
        if (!columnValueToSlugify) {
          return; // throw new Error(`Column ${field.details.derivedFrom} not found`);
        }
        dataParams[field.column!] = slugifyForUrl(
          columnValueToSlugify.toString(),
        );
      } else {
        dataParams[field.column!] = field.values![index];
      }
    });

  const dynamicPrisma = prisma as any;

  // Update row
  if (id) {
    await dynamicPrisma[table].update({
      where: {
        id,
        ...tableRelation,
      },
      data: dataParams,
    });
    return id;
  }
  // Create row
  else {
    const createdRow = await dynamicPrisma[table].create({
      data: dataParams,
    });

    return createdRow.id as number;
  }
}

async function writeMappingChanges(
  table: string,
  id: number,
  fields: FieldOrm[],
) {
  const dynamicPrisma = prisma as any;

  /** Protects from CRUD'ing rows not mapped to the row ID that the API call is updating */
  const tableRelation = {
    [table + "_id"]: id,
  };

  for (let field of fields) {
    if (field.type != "mapping") continue;
    const mappingTable = field.mappingTable;

    if (!allowedMappingsByTable[table].includes(mappingTable.name)) {
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
      if (mappingId < 0) {
        // Create
        const dataParams: any = {
          ...tableRelation,
        };

        mappingTable.fields
          .filter((field) => field.column)
          .forEach((field) => {
            dataParams[field.column!] = field.values![index];
          });

        await dynamicPrisma[mappingTable.name].create({
          data: dataParams,
        });
      } else if (mappingTable.fields.some((field) => field.modified?.[index])) {
        // Update
        writeFieldChanges(
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

export async function deleteRow(table: TableOrm, id: number) {
  const dynamicPrisma = prisma as any;

  await dynamicPrisma[table.name].delete({
    where: {
      id,
    },
  });
}
