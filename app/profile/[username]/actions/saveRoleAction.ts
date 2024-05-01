"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import * as roleService from "@/backend/roleService";
import { errorResponse } from "@/shared/serviceResponse";
import { $Enums } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function saveRole(userId: string, newRole: $Enums.user_role_type) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return errorResponse("You must login to save changes");
  }

  return await roleService.saveRole(session.user.id, userId, newRole);
}
