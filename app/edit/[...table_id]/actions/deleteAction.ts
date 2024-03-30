"use server";

import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function deleteAction(table: TableOrm, id: number) {
  return await deleteRow(table, id);
}
