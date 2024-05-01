"use server";

import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupFieldOrm } from "@/database/orm/ormTypes";
import { contentResponse } from "@/shared/serviceResponse";

export default async function lookupAction(
  terms: string,
  lookupField: LookupFieldOrm["lookup"],
) {
  if (!terms) {
    return contentResponse([]);
  }

  return await lookupTermsInTable(terms, lookupField);
}
