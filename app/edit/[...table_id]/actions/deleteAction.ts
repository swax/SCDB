"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function deleteAction(
  table: TableOrm,
  id: number,
  slug: string,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    revalidateContent(table.name, id, slug);

    await deleteRow(user, table, id);
  });
}
