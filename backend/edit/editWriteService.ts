import prisma from "@/database/prisma";
import { slugifyForUrl } from "@/shared/string";
import scdbOrms from "./orm/scdbOrms";
import { FieldOrm, MappingEditField, TableOrm } from "./orm/tableOrmTypes";

const allowedColumnsByTable: { [key: string]: string[] } = {};
const allowedMappingsByTable: { [key: string]: string[] } = {};

function isMappingField(e: FieldOrm): e is MappingEditField {
  return e.type === "mapping";
}

Object.keys(scdbOrms).forEach((table) => {
  allowedColumnsByTable[table] = scdbOrms[table].fields
    .filter((field) => field.column)
    .map((field) => field.column!);

  allowedMappingsByTable[table] = scdbOrms[table].fields
    .filter(isMappingField)
    .map((field) => field.mapping.name);
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

  const rowId = await writeFieldChanges(table.name, id, table.fields, 0, {});

  await writeMappingChanges(table.name, rowId, table.fields);

  // TODO: Write audit record

  return rowId;
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
      if (field.type == "slug") {
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
    const mapping = field.mapping;

    if (!allowedMappingsByTable[table].includes(mapping.name)) {
      throw new Error(`Edit mapping on ${mapping?.name} not allowed`);
    }

    for (let removedId of mapping.removeIds || []) {
      // Delete
      await dynamicPrisma[mapping.name].delete({
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

        await dynamicPrisma[mapping.name].create({
          data: dataParams,
        });
      } else if (mapping.fields.some((field) => field.modified?.[index])) {
        // Update
        writeFieldChanges(
          mapping.name,
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

export async function deleteRow(table: TableOrm, id: number) {
  const dynamicPrisma = prisma as any;

  await dynamicPrisma[table.name].delete({
    where: {
      id,
    },
  });
}
