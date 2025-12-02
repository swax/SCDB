"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import {
  catchServiceErrors,
  getLoggedInUser,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import { TableCms } from "@/backend/cms/cmsTypes";
import { deleteRow, getSlugForId } from "@/backend/edit/editWriteService";
import { user_role_type } from "@/shared/enums";

export default async function deleteAction(table: TableCms, id: number) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    validateRoleAtLeast(user.role, user_role_type.Editor);

    const slug = await getSlugForId(table, id);

    revalidateContent(table.name, id, slug);

    await deleteRow(user, table, id);
  });
}
