import prisma from "@/database/prisma";
import { notFound } from "next/navigation";
import tableEditConfigs, { TableEditConfig } from "./tableEditConfigs";

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
  // Base prisma select
  const findUniqueParams = {
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  };

  // Dynamically add fields to the select
  config.fields.forEach((field) => {
    const dynamicField: any = findUniqueParams.select;
    dynamicField[field.column] = true;
  });

  // Dynamically select the table
  const dynamicTable = prisma as any;

  const fieldValues = await dynamicTable[config.table].findUnique(
    findUniqueParams
  );

  if (!fieldValues) {
    notFound();
  }

  // Add fields values to the table config
  Object.entries(fieldValues).forEach(([key, value]) => {
    const field = config.fields.find((field) => field.column === key);
    if (field) {
      field.originalValue = value;
      field.newValue = value;
    }
  });
}
