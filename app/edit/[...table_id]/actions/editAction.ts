"use server";

import {
  catchServiceErrors,
  validateLoggedIn,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { user_role_type } from "@prisma/client";

export default async function editAction(table: TableOrm, id: number) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    validateRoleAtLeast(session.user.role, user_role_type.Editor);

    return await writeFieldValues(session.user.id, table, id);
  });
}
