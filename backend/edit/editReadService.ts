import prisma from "@/database/prisma";
import { notFound } from "next/navigation";
import scdbOrms from "./orm/scdbOrms";
import { FieldOrm, TableOrm } from "./orm/tableOrmTypes";

export function findAndBuildTableOrm(table: string) {
  const tableOrm = scdbOrms[table];

  if (!tableOrm) {
    notFound();
  }

  return structuredClone(tableOrm);
}

export async function getTableOrm(table: string, id: number) {
  const tableOrm = findAndBuildTableOrm(table);

  tableOrm.operation = id ? "update" : "create";

  if (id) {
    await setFieldValues(tableOrm, id);
  }

  return tableOrm;
}

export async function setFieldValues(table: TableOrm, id: number) {
  // Base select
  const selectParams: any = {
    id: true,
  };

  addFieldsToSelect(table, selectParams);

  // Perform the select
  const dynamicPrisma = prisma as any;

  const dbResults = await dynamicPrisma[table.name].findUnique({
    where: {
      id: id,
    },
    select: selectParams,
  });

  if (!dbResults) {
    notFound();
  }

  // Map values from the db to the orm
  mapDatabaseToOrm(dbResults, table.fields);
}

function addFieldsToSelect(table: TableOrm, selectParams: any) {
  // Add fields to the select
  table.fields.forEach((field) => {
    if (field.type === "mapping" && field.mapping) {
      const selectMany = {
        select: {
          id: true,
        },
      };

      addFieldsToSelect(field.mapping, selectMany.select);

      selectParams[field.mapping.name + "s"] = selectMany;
    } else if (field.type === "lookup" && field.lookup) {
      const selectOne = {
        select: {
          [field.lookup.labelColumn]: true,
        },
      };
      selectParams[field.lookup.table] = selectOne;
    }

    if (field.column) {
      selectParams[field.column] = true;
    }
  });
}

function mapDatabaseToOrm(dbResult: any, fields: FieldOrm[]) {
  Object.entries(dbResult).forEach(([dbKey, dbValue]) => {
    fields.forEach((field) => {
      if (field.column == dbKey) {
        field.values ||= [];
        field.values.push(dbValue as any);
      } else if (
        field.type == "lookup" &&
        field.lookup.table === dbKey &&
        dbValue
      ) {
        const lookupValue = (dbValue as any)[field.lookup.labelColumn];
        field.lookup.labelValues ||= [];
        field.lookup.labelValues.push(lookupValue);
      } else if (
        field.type == "mapping" &&
        field.mapping?.name + "s" === dbKey &&
        Array.isArray(dbValue)
      ) {
        const mappingFields = field.mapping.fields;
        dbValue.forEach((subResult) => {
          field.mapping!.ids ||= [];
          field.mapping!.ids.push(subResult.id);
          mapDatabaseToOrm(subResult, mappingFields);
        });
      }
    });
  });
}
