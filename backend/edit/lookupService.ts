import prisma from "@/database/prisma";
import { contentResponse } from "@/shared/serviceResponse";
import { FieldOrm, LookupFieldOrm } from "../../database/orm/ormTypes";
import sketchDatabaseOrm from "../../database/orm/sketchDatabaseOrm";

export interface LookupFieldOption {
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
        validateFieldWithLookup(field.mappingTable.fields, lookupField)),
  );
}

export default async function lookupTermsInTable(
  searchString: string,
  lookupField: LookupFieldOrm["lookup"],
) {
  const allowedLookup = Object.keys(sketchDatabaseOrm).some((table) =>
    validateFieldWithLookup(sketchDatabaseOrm[table].fields, lookupField),
  );

  if (!allowedLookup) {
    throw `Lookup on ${lookupField.table}/${lookupField.labelColumn} not allowed`;
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
