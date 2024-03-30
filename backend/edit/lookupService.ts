import prisma from "@/database/prisma";
import scdbOrms from "./orm/scdbOrms";
import { FieldOrm, LookupFieldOrm } from "./orm/tableOrmTypes";

export interface AutocompleteLookupOption {
  id: number;
  label: string;
  createNew?: boolean;
  noMatches?: boolean;
}

function validateFieldWithLookup(
  fields: FieldOrm[],
  lookupField: LookupFieldOrm["lookup"],
): boolean {
  return fields.some(
    (field) =>
      (field.type == "lookup" &&
        field.lookup.table === lookupField.table &&
        field.lookup.labelColumn === lookupField.labelColumn) ||
      (field.type == "mapping" &&
        validateFieldWithLookup(field.mapping.fields, lookupField)),
  );
}

export default async function lookupTermsInTable(
  terms: string,
  lookupField: LookupFieldOrm["lookup"],
): Promise<AutocompleteLookupOption[]> {
  const allowedLookup = Object.keys(scdbOrms).some((key) =>
    validateFieldWithLookup(scdbOrms[key].fields, lookupField),
  );

  if (!allowedLookup) {
    throw new Error(
      `Lookup on ${lookupField.table}/${lookupField.labelColumn} not allowed`,
    );
  }

  const dynamicPrisma = prisma as any;

  const results = await dynamicPrisma[lookupField.table].findMany({
    where: {
      [lookupField.labelColumn]: {
        contains: terms,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      [lookupField.labelColumn]: true,
    },
  });

  // Map results to AutocompleteLookupOption
  if (!results) {
    return [];
  }

  return results.map((result: any) => ({
    id: result.id,
    label: result[lookupField.labelColumn],
  }));
}
