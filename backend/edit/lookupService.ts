import prisma from "@/database/prisma";
import tableEditConfigs, {
  TableEditField,
  LookupEditField,
} from "./tableEditConfigs";

export interface AutocompleteLookupOption {
  id: number;
  label: string;
  createNew?: boolean;
  noMatches?: boolean;
}

function validateFieldWithLookup(
  fields: TableEditField[],
  lookupField: LookupEditField['details']
): boolean {
  return fields.some(
    (field) =>
      (field.type == "lookup" &&
        field.details.table === lookupField.table &&
        field.details.column === lookupField.column) ||
      (field.type == 'mapping' &&
        validateFieldWithLookup(field.details.fields, lookupField))
  );
}

export default async function lookupTermsInTable(
  terms: string,
  lookupField: LookupEditField['details']
): Promise<AutocompleteLookupOption[]> {
  const allowedLookup = Object.keys(tableEditConfigs).some((key) =>
    validateFieldWithLookup(tableEditConfigs[key].fields, lookupField)
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
