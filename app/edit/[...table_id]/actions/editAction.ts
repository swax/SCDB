"use server";

import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function editAction(table: TableOrm, id: number) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    return await writeFieldValues(user, table, id);
  });
}
