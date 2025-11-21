import prisma from "@/database/prisma";
import { getRoleRank } from "@/shared/roleUtils";
import { user_role_type } from '@/shared/enums';
import { notFound } from "next/navigation";
import { FieldCms, TableCms } from "../cms/cmsTypes";
import sketchDatabaseCms from "../cms/sketchDatabaseCms";

export function findAndBuildTableCms(table: string) {
  const tableCms = sketchDatabaseCms[table];

  if (!tableCms) {
    notFound();
  }

  return structuredClone(tableCms);
}

export async function getTableCms(
  table: string,
  id: number,
  role?: user_role_type,
) {
  // Replace - with _
  table = table.replace("-", "_");

  const tableCms = findAndBuildTableCms(table);

  tableCms.operation = id ? "update" : "create";

  const includeReviewStatus =
    getRoleRank(role) >= getRoleRank(user_role_type.Moderator);

  if (id) {
    await setFieldValues(tableCms, id, includeReviewStatus);
  }

  return tableCms;
}

export async function setFieldValues(
  table: TableCms,
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

  // Map values from the db to the cms
  mapDatabaseToCms(dbResult, table.fields);

  if (dbResult.review_status) {
    table.reviewStatus = dbResult.review_status;
  }
}

function addFieldsToSelect(table: Omit<TableCms, "title">, selectParams: any) {
  // Add fields to the select
  table.fields.forEach((field) => {
    if (field.type === "mapping") {
      const selectMany = {
        select: {
          id: true,
        },
        orderBy: {
          sequence: "asc",
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

function mapDatabaseToCms(dbResult: any, fields: FieldCms[]) {
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
            mapDatabaseToCms(subResult, mappingFields);
          });
        }
      }
    });
  });
}
