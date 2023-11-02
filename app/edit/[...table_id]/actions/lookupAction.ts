"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupEditField } from "@/backend/edit/tableConfigs/tableEditTypes";

export default async function lookupAction(
  terms: string,
  lookupField: LookupEditField["lookup"],
) {
  if (!terms) return [];

  return await lookupTermsInTable(terms, lookupField);
}
