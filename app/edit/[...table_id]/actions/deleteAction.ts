"use server";

import {
  catchServiceErrors,
  validateCanEdit,
  validateLoggedIn,
} from "@/backend/actionHelper";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function deleteAction(table: TableOrm, id: number) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    validateCanEdit(session.user.role);

    await deleteRow(session.user.id, table, id);
  });
}
