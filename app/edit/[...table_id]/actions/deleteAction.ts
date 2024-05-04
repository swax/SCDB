"use server";

import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function deleteAction(table: TableOrm, id: number) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    await deleteRow(user, table, id);
  });
}
