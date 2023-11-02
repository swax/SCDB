"use server";

import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableEditConfig } from "@/backend/edit/tableConfigs/tableEditTypes";

export default async function editAction(
  editConfig: TableEditConfig,
  id: number,
) {
  return await writeFieldValues(editConfig, id);
}
