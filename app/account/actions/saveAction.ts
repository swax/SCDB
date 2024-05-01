"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import * as accountService from "@/backend/accountService";
import { canEdit } from "@/shared/roleUtils";
import { emptyResponse, errorResponse } from "@/shared/serviceResponse";
import { getServerSession } from "next-auth";

export default async function saveUsername(username: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return errorResponse("You must be logged in to edit");
  }

  if (!canEdit(session.user.role)) {
    return errorResponse("You do not have permission to edit");
  }

  await accountService.saveUsername(session.user.id, username);

  return emptyResponse();
}
