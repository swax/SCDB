"use server";

import { catchServiceErrors } from "@/backend/actionHelper";
import lookupTermsInTable from "@/backend/edit/lookupService";
import { LookupFieldCms } from "@/database/orm/ormTypes";
import { contentResponse } from "@/shared/serviceResponse";

export default async function lookupAction(
  terms: string,
  lookupField: LookupFieldCms["lookup"],
) {
  if (!terms) {
    return contentResponse([]);
  }

  return await catchServiceErrors(() => lookupTermsInTable(terms, lookupField));
}
