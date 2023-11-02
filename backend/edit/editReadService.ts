import prisma from "@/database/prisma";
import { notFound } from "next/navigation";
import tableEditConfigs from "./tableConfigs/tableEditConfigs";
import { TableEditConfig, TableEditField } from "./tableConfigs/tableEditTypes";

export function findAndBuildConfig(table: string) {
  const config = tableEditConfigs[table];

  if (!config) {
    notFound();
  }

  return structuredClone(config);
}

export async function getTableEditConfig(table: string, id: number) {
  const config = findAndBuildConfig(table);

  config.operation = id ? "update" : "create";

  if (id) {
    await setFieldValues(config, id);
  }

  return config;
}

export async function setFieldValues(config: TableEditConfig, id: number) {
  // Base select
  const selectParams: any = {
    id: true,
  };

  addFieldsToSelect(config, selectParams);

  // Perform the select
  const dynamicPrisma = prisma as any;

  const dbResults = await dynamicPrisma[config.table].findUnique({
    where: {
      id: id,
    },
    select: selectParams,
  });

  if (!dbResults) {
    notFound();
  }

  // Map values from the db to the config
  mapResultsToConfig(dbResults, config.fields);
}

function addFieldsToSelect(config: TableEditConfig, selectParams: any) {
  // Add fields to the select
  config.fields.forEach((field) => {
    if (field.type === "mapping" && field.mapping) {
      const selectMany = {
        select: {
          id: true,
        },
      };

      addFieldsToSelect(field.mapping, selectMany.select);

      selectParams[field.mapping.table + "s"] = selectMany;
    } else if (field.type === "lookup" && field.lookup) {
      const selectOne = {
        select: {
          [field.lookup.column]: true,
        },
      };
      selectParams[field.lookup.table] = selectOne;
    }

    if (field.column) {
      selectParams[field.column] = true;
    }
  });
}

function mapResultsToConfig(dbResults: any, fields: TableEditField[]) {
  Object.entries(dbResults).forEach(([key, value]) => {
    fields.forEach((field) => {
      if (field.column == key) {
        field.values ||= [];
        field.values.push(value);
      } else if (
        field.type == "lookup" &&
        field.lookup.table === key &&
        value
      ) {
        const lookupValue = (value as any)[field.lookup.column];
        field.lookup.values ||= [];
        field.lookup.values.push(lookupValue);
      } else if (
        field.type == "mapping" &&
        field.mapping?.table + "s" === key &&
        Array.isArray(value)
      ) {
        const mappingFields = field.mapping.fields;
        value.forEach((v) => {
          field.mapping!.ids ||= [];
          field.mapping!.ids.push(v.id);
          mapResultsToConfig(v, mappingFields);
        });
      }
    });
  });
}
