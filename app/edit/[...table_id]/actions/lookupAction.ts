"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupFieldOrm } from "@/backend/edit/orm/tableOrmTypes";

export default async function lookupAction(
  terms: string,
  lookupField: LookupFieldOrm["lookup"],
) {
  if (!terms) return [];

  return await lookupTermsInTable(terms, lookupField);
}
