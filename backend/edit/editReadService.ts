import prisma from "@/database/prisma";
import { notFound } from "next/navigation";
import tableEditConfigs, {
  TableEditConfig,
  TableEditField,
} from "./tableEditConfigs";

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
    if (field.type === "mapping" && field.details) {
      const selectMany = {
        select: {
          id: true,
        },
      };

      addFieldsToSelect(field.details, selectMany.select);

      selectParams[field.details.table + "s"] = selectMany;
    } else if (field.type === "lookup" && field.details) {
      const selectOne = {
        select: {
          [field.details.column]: true,
        },
      };
      selectParams[field.details.table] = selectOne;
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
      } else if (field.type == 'lookup' && field.details.table === key && value) {
        const lookupValue = (value as any)[field.details.column];
        field.details.values ||= [];
        field.details.values.push(lookupValue);
      } else if (
        field.type == 'mapping' &&
        field.details?.table + "s" === key &&
        Array.isArray(value)
      ) {
        const mappingFields = field.details.fields;
        value.forEach((v) => {
          field.details!.ids ||= [];
          field.details!.ids.push(v.id);
          mapResultsToConfig(v, mappingFields);
        });
      }
    });
  });
}
