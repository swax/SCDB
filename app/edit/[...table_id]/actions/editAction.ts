"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";

export default async function editAction(
  table: TableOrm,
  id: number,
  slug: string,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    revalidateContent(table.name, id, slug);

    const response = await writeFieldValues(user, table, id);

    // If the name is changing back to something that already existed before,
    // Make sure to revalidate it otherwise we can get into a redirect loop
    const newSlug = response.content?.newSlug;
    if (newSlug && newSlug !== slug) {
      revalidateContent(table.name, id, newSlug);
    }

    return response;
  });
}
