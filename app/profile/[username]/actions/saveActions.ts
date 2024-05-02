"use server";

import { catchServiceErrors, validateLoggedIn } from "@/backend/actionHelper";
import * as roleService from "@/backend/roleService";
import { user_role_type } from "@prisma/client";

export async function saveRole(userId: string, newRole: user_role_type) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    await roleService.saveRole(session.user.id, userId, newRole);
  });
}

export async function saveModNote(userId: string, modNote: string) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    await roleService.saveModNote(session.user.id, userId, modNote);
  });
}
