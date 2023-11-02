"use server";

import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableEditConfig } from "@/backend/edit/tableConfigs/tableEditTypes";

export default async function editAction(
  editConfig: TableEditConfig,
  id: number
) {
  await writeFieldValues(editConfig, id);
}
