"use server";

import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/backend/edit/orm/tableOrmTypes";

export default async function deleteAction(table: TableOrm, id: number) {
  return await deleteRow(table, id);
}
