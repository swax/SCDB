"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { deleteRow, getSlugForId } from "@/backend/edit/editWriteService";
import { TableCms } from "@/backend/cms/cmsTypes";

export default async function deleteAction(table: TableCms, id: number) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    const slug = await getSlugForId(table, id);

    revalidateContent(table.name, id, slug);

    await deleteRow(user, table, id);
  });
}
