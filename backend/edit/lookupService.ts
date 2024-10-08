import prisma from "@/database/prisma";
import { contentResponse } from "@/shared/serviceResponse";
import { FieldCms, LookupFieldCms } from "../cms/cmsTypes";
import sketchDatabaseCms from "../cms/sketchDatabaseCms";

export interface LookupFieldOption {
  id: number;
  label: string;
  createNew?: boolean;
  noMatches?: boolean;
}

function validateFieldWithLookup(
  fields: FieldCms[],
  lookupField: LookupFieldCms["lookup"],
): boolean {
  return fields.some(
    (field) =>
      (field.type == "lookup" &&
        field.lookup.table === lookupField.table &&
        field.lookup.labelColumn === lookupField.labelColumn) ||
      (field.type == "mapping" &&
        validateFieldWithLookup(field.mappingTable.fields, lookupField)),
  );
}

export default async function lookupTermsInTable(
  searchString: string,
  lookupField: LookupFieldCms["lookup"],
) {
  const allowedLookup = Object.keys(sketchDatabaseCms).some((table) =>
    validateFieldWithLookup(sketchDatabaseCms[table].fields, lookupField),
  );

  if (!allowedLookup) {
    throw new Error(
      `Lookup on ${lookupField.table}/${lookupField.labelColumn} not allowed`,
    );
  }

  const dynamicPrisma = prisma as any;

  const whereClauses = searchString.split(" ").map((term) => ({
    [lookupField.labelColumn]: {
      contains: term,
      mode: "insensitive",
    },
  }));

  const results = await dynamicPrisma[lookupField.table].findMany({
    where: {
      AND: whereClauses,
    },
    select: {
      id: true,
      [lookupField.labelColumn]: true,
    },
  });

  // Map results to LookupFieldOption
  const lookupResults: LookupFieldOption[] = (results || []).map(
    (result: any) => ({
      id: result.id,
      label: result[lookupField.labelColumn],
    }),
  );

  return contentResponse(lookupResults);
}
