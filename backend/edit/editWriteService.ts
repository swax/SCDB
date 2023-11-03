import prisma from "@/database/prisma";
import { slugifyForUrl } from "@/shared/string";
import tableEditConfigs from "./tableConfigs/tableEditConfigs";
import {
  MappingEditField,
  TableEditConfig,
  TableEditField,
} from "./tableConfigs/tableEditTypes";

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

function isMappingField(e: TableEditField): e is MappingEditField {
  return e.type === "mapping";
}

Object.keys(tableEditConfigs).forEach((table) => {
  allowedColumnsByTable[table] = tableEditConfigs[table].fields
    .filter((field) => field.column)
    .map((field) => field.column!);

  allowedMappingsByTable[table] = tableEditConfigs[table].fields
    .filter(isMappingField)
    .map((field) => field.mapping.table);
});

/** Write field values to the database
 * @param config The config from the client, don't trust it
 */
export async function writeFieldValues(config: TableEditConfig, id: number) {
  // Verify table is allowed to be edited
  const allowedColumns = allowedColumnsByTable[config.table];

  if (!allowedColumns) {
    throw new Error(`Table ${config.table} not allowed`);
  }

  const rowId = await writeFieldChanges(config.table, id, config.fields, 0, {});

  await writeMappingChanges(config.table, rowId, config.fields);

  // TODO: Write audit record

  return rowId;
}

async function writeFieldChanges(
  table: string,
  id: number,
  fields: TableEditField[],
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
      if (field.type == "slug") {
        const columnValueToSlugify = dataParams[field.derivedFrom];
        if (!columnValueToSlugify) {
          return; // throw new Error(`Column ${field.details.derivedFrom} not found`);
        }
        dataParams[field.column!] = slugifyForUrl(columnValueToSlugify);
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
  fields: TableEditField[],
) {
  const dynamicPrisma = prisma as any;

  /** Protects from CRUD'ing rows not mapped to the row ID that the API call is updating */
  const tableRelation = {
    [table + "_id"]: id,
  };

  for (let field of fields) {
    if (field.type != "mapping") continue;
    const mapping = field.mapping;

    if (!allowedMappingsByTable[table].includes(mapping.table)) {
      throw new Error(`Edit mapping on ${mapping?.table} not allowed`);
    }

    for (let removedId of mapping.removeIds || []) {
      // Delete
      await dynamicPrisma[mapping.table].delete({
        where: {
          id: removedId,
          ...tableRelation,
        },
      });
    }

    let index = 0;
    for (let mappingId of mapping.ids || []) {
      if (mappingId < 0) {
        // Create
        const dataParams: any = {
          ...tableRelation,
        };

        mapping.fields
          .filter((field) => field.column)
          .forEach((field) => {
            dataParams[field.column!] = field.values![index];
          });

        await dynamicPrisma[mapping.table].create({
          data: dataParams,
        });
      } else if (mapping.fields.some((field) => field.modified?.[index])) {
        // Update
        writeFieldChanges(
          mapping.table,
          mappingId,
          mapping.fields,
          index,
          tableRelation,
        );
      }
      index++;
    }
  }
}

export async function deleteRow(config: TableEditConfig, id: number) {
  const dynamicPrisma = prisma as any;

  await dynamicPrisma[config.table].delete({
    where: {
      id,
    },
  });
}
