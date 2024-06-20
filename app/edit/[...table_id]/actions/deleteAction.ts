"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableCms } from "@/backend/cms/cmsTypes";

export default async function deleteAction(
  table: TableCms,
  id: number,
  slug: string,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    revalidateContent(table.name, id, slug);

    await deleteRow(user, table, id);
  });
}
