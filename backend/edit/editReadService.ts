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
    const dynamicSelect: any = findUniqueParams.select;

    if (field.type === "mapping") {
      // todo
    } else if (field.type === "lookup" && field.lookup) {
      dynamicSelect[field.lookup.table] = {
        select: {
          [field.lookup.column]: true,
        },
      };
    }

    if (field.column) {
      dynamicSelect[field.column] = true;
    }
  });

  // Dynamically select the table
  const dynamicPrisma = prisma as any;
  const dynamicTable = dynamicPrisma[config.table];

  if (!dynamicTable) {
    throw new Error(`Table ${config.table} not found on prisma client`);
  }

  const fieldValues = await dynamicTable.findUnique(findUniqueParams);

  if (!fieldValues) {
    notFound();
  }

  // Add fields values to the table config
  Object.entries(fieldValues).forEach(([key, value]) => {
    let field = config.fields.find((f) => f.column === key);

    if (field) {
      field.originalValue = value;
      field.newValue = value;
      return;
    }

    field = config.fields.find((f) => f.lookup?.table === key);

    if (value && field && field.lookup) {
      const dynamicValue = value as any;
      field.lookup.value = dynamicValue[field.lookup.column];
    }
  });
}
