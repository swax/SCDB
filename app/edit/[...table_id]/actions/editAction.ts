"use server";

import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/backend/edit/orm/tableOrmTypes";

export default async function editAction(table: TableOrm, id: number) {
  return await writeFieldValues(table, id);
}
