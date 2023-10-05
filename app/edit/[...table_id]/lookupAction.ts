"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { TableLookupField } from "@/backend/edit/tableEditConfigs";

export default async function lookupAction(terms: string, lookupField: TableLookupField) {
  if (!terms) return [];

  return await lookupTermsInTable(terms, lookupField);
}
