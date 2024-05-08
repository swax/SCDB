"use server";

import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import * as roleService from "@/backend/mgmt/roleService";
import { user_role_type } from "@prisma/client";

export async function saveRole(userId: string, newRole: user_role_type) {
  return await catchServiceErrors(async () => {
    const sessionUser = await getLoggedInUser();

    await roleService.saveRole(sessionUser, userId, newRole);
  });
}

export async function saveModNote(userId: string, modNote: string) {
  return await catchServiceErrors(async () => {
    const sessionUser = await getLoggedInUser();

    await roleService.saveModNote(sessionUser, userId, modNote);
  });
}
