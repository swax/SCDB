"use server";

import { deleteRow } from "@/backend/edit/editWriteService";
import { TableEditConfig } from "@/backend/edit/tableConfigs/tableEditTypes";

export default async function deleteAction(
  editConfig: TableEditConfig,
  id: number,
) {
  return await deleteRow(editConfig, id);
}
