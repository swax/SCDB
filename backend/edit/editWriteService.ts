import prisma from "@/database/prisma";
import tableEditConfigs, {
  TableEditConfig,
  TableEditField,
} from "./tableEditConfigs";

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

Object.keys(tableEditConfigs).forEach((table) => {
  allowedColumnsByTable[table] = tableEditConfigs[table].fields
    .filter((field) => field.column)
    .map((field) => field.column!);

  allowedMappingsByTable[table] = tableEditConfigs[table].fields
    .filter((field) => field.mapping)
    .map((field) => field.mapping!.table);
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

  await writeFieldChanges(config.table, id, config.fields, 0);

  await writeMappingChanges(config.table, id, config.fields);

  // TODO: Write audit record
}

async function writeFieldChanges(
  table: string,
  id: number,
  fields: TableEditField[],
  index: number
) {
  const dataParams: any = {};

  fields
    .filter((field) => field.column && field.modified?.[index])
    .forEach((field) => {
      // TODO: Validate columns are in master config for fields and lookups
      /* if (!allowedColumns.includes(field.column!)) {
        throw new Error(`Column ${field.column} not allowed`);
      }*/
      dataParams[field.column!] = field.values![index];
    });

  const dynamicPrisma = prisma as any;

  await dynamicPrisma[table].update({
    where: {
      id,
    },
    data: dataParams,
  });
}

async function writeMappingChanges(
  table: string,
  id: number,
  fields: TableEditField[]
) {
  const dynamicPrisma = prisma as any;

  for (let field of fields) {
    const mapping = field.mapping;
    if (!mapping) continue;

    if (!allowedMappingsByTable[table].includes(mapping.table)) {
      throw new Error(`Edit mapping on ${mapping?.table} not allowed`);
    }

    for (let removedId of mapping.removeIds || []) {
      // Delete
      await dynamicPrisma[mapping.table].delete({
        where: {
          id: removedId,
        },
      });
    }

    let index = 0;
    for (let mappingId of mapping.ids || []) {
      if (mappingId < 0) {
        // Create
        const dataParams: any = {
          [table + "_id"]: id,
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
        writeFieldChanges(mapping.table, mappingId, mapping.fields, index);
      }
      index++;
    }
  }
}
