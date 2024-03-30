"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupFieldOrm } from "@/database/orm/ormTypes";

export default async function lookupAction(
  terms: string,
  lookupField: LookupFieldOrm["lookup"],
) {
  if (!terms) return [];

  return await lookupTermsInTable(terms, lookupField);
}
