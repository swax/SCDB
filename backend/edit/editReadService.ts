import prisma from "@/database/prisma";
import { getRoleRank } from "@/shared/roleUtils";
import { user_role_type } from "@prisma/client";
import { notFound } from "next/navigation";
import { FieldOrm, TableOrm } from "../../database/orm/ormTypes";
import sketchDatabaseOrm from "../../database/orm/sketchDatabaseOrm";

export function findAndBuildTableOrm(table: string) {
  const tableOrm = sketchDatabaseOrm[table];

  if (!tableOrm) {
    notFound();
  }

  return structuredClone(tableOrm);
}

export async function getTableOrm(
  table: string,
  id: number,
  role?: user_role_type,
) {
  const tableOrm = findAndBuildTableOrm(table);

  tableOrm.operation = id ? "update" : "create";

  const includeReviewStatus =
    getRoleRank(role) >= getRoleRank(user_role_type.Moderator);

  if (id) {
    await setFieldValues(tableOrm, id, includeReviewStatus);
  }

  return tableOrm;
}

export async function setFieldValues(
  table: TableOrm,
  id: number,
  includeReviewStatus: boolean,
) {
  // Base select
  const selectParams: any = {
    id: true,
    ...(includeReviewStatus && { review_status: true }),
  };

  addFieldsToSelect(table, selectParams);

  // Perform the select
  const dynamicPrisma = prisma as any;

  const dbResult = await dynamicPrisma[table.name].findUnique({
    where: {
      id: id,
    },
    select: selectParams,
  });

  if (!dbResult) {
    notFound();
  }

  // Map values from the db to the orm
  mapDatabaseToOrm(dbResult, table.fields);

  if (dbResult.review_status) {
    table.reviewStatus = dbResult.review_status;
  }
}

function addFieldsToSelect(table: Omit<TableOrm, "title">, selectParams: any) {
  // Add fields to the select
  table.fields.forEach((field) => {
    if (field.type === "mapping") {
      const selectMany = {
        select: {
          id: true,
        },
      };

      addFieldsToSelect(field.mappingTable, selectMany.select);

      selectParams[field.mappingTable.navProp] = selectMany;
    } else if (field.type === "lookup") {
      const selectOne = {
        select: {
          [field.lookup.labelColumn]: true,
        },
      };
      selectParams[field.lookup.table] = selectOne;
    } else if (field.type === "image") {
      const selectOne = {
        select: {
          cdn_key: true,
        },
      };
      selectParams[field.navProp] = selectOne;
    }

    if (field.column) {
      selectParams[field.column] = true;
    }
  });
}

function mapDatabaseToOrm(dbResult: any, fields: FieldOrm[]) {
  Object.entries(dbResult).forEach(([dbKey, dbValue]) => {
    fields.forEach((field) => {
      if (field.type == "image") {
        if (field.navProp == dbKey) {
          field.values ||= [];
          field.values.push((dbValue as any)?.cdn_key);
        }
      } else if (field.column == dbKey) {
        field.values ||= [];
        field.values.push(dbValue as any);
      } else if (field.type == "lookup") {
        if (field.lookup.table === dbKey) {
          const lookupValue = dbValue
            ? (dbValue as any)[field.lookup.labelColumn]
            : null;
          field.lookup.labelValues ||= [];
          field.lookup.labelValues.push(lookupValue);
        }
      } else if (field.type == "mapping") {
        if (field.mappingTable?.navProp === dbKey && Array.isArray(dbValue)) {
          const mappingFields = field.mappingTable.fields;
          field.mappingTable.ids ||= [];
          dbValue.forEach((subResult) => {
            field.mappingTable.ids?.push(subResult.id);
            mapDatabaseToOrm(subResult, mappingFields);
          });
        }
      }
    });
  });
}
