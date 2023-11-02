"use server";

import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableEditConfig } from "@/backend/edit/tableEditConfigs";

export default async function editAction(
  editConfig: TableEditConfig,
  id: number
) {
  await writeFieldValues(editConfig, id);
}
