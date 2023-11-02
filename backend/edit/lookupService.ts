import prisma from "@/database/prisma";
import tableEditConfigs from "./tableConfigs/tableEditConfigs";
import { LookupEditField, TableEditField } from "./tableConfigs/tableEditTypes";

export interface AutocompleteLookupOption {
  id: number;
  label: string;
  createNew?: boolean;
  noMatches?: boolean;
}

function validateFieldWithLookup(
  fields: TableEditField[],
  lookupField: LookupEditField["lookup"],
): boolean {
  return fields.some(
    (field) =>
      (field.type == "lookup" &&
        field.lookup.table === lookupField.table &&
        field.lookup.column === lookupField.column) ||
      (field.type == "mapping" &&
        validateFieldWithLookup(field.mapping.fields, lookupField)),
  );
}

export default async function lookupTermsInTable(
  terms: string,
  lookupField: LookupEditField["lookup"],
): Promise<AutocompleteLookupOption[]> {
  const allowedLookup = Object.keys(tableEditConfigs).some((key) =>
    validateFieldWithLookup(tableEditConfigs[key].fields, lookupField),
  );

  if (!allowedLookup) {
    throw new Error(
      `Lookup on ${lookupField.table}/${lookupField.column} not allowed`,
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
