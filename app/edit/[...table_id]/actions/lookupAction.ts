"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupEditField } from "@/backend/edit/tableEditConfigs";

export default async function lookupAction(terms: string, lookupField: LookupEditField['details']) {
  if (!terms) return [];

  return await lookupTermsInTable(terms, lookupField);
}
