import prisma from "@/database/prisma";
import { notFound } from "next/navigation";
import sketchDatabaseOrm from "../../database/orm/sketchDatabaseOrm";
import { FieldOrm, TableOrm } from "../../database/orm/ormTypes";

export function findAndBuildTableOrm(table: string) {
  const tableOrm = sketchDatabaseOrm[table];

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
    if (field.type === "mapping" && field.mappingTable) {
      const selectMany = {
        select: {
          id: true,
        },
      };

      addFieldsToSelect(field.mappingTable, selectMany.select);

      selectParams[field.mappingTable.name + "s"] = selectMany;
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
        field.mappingTable?.name + "s" === dbKey &&
        Array.isArray(dbValue)
      ) {
        const mappingFields = field.mappingTable.fields;
        dbValue.forEach((subResult) => {
          field.mappingTable!.ids ||= [];
          field.mappingTable!.ids.push(subResult.id);
          mapDatabaseToOrm(subResult, mappingFields);
        });
      }
    });
  });
}
