import { table } from "console";
import tableEditConfigs, { TableLookupField } from "./tableEditConfigs";
import prisma from "@/database/prisma";

export interface AutocompleteLookupOption {
  id: number;
  label: string;
}

export default async function lookupTermsInTable(
  terms: string,
  lookupField: TableLookupField
): Promise<AutocompleteLookupOption[]> {
  const allowedLookup = Object.keys(tableEditConfigs).some((key) =>
    tableEditConfigs[key].fields.some(
      (field) =>
        field.lookup &&
        field.lookup.table === lookupField.table &&
        field.lookup.column === lookupField.column
    )
  );

  if (!allowedLookup) {
    throw new Error(
      `Lookup on ${lookupField.table}/${lookupField.column} not allowed`
    );
  }

  const dynamicPrisma = prisma as any;

  const results = await dynamicPrisma[lookupField.table].findMany({
    where: {
      [lookupField.column]: {
        contains: terms,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      [lookupField.column]: true,
    },
  });

  // Map results to AutocompleteLookupOption
  if (!results) {
    return [];
  }

  return results.map((result: any) => ({
    id: result.id,
    label: result[lookupField.column],
  }));
}
