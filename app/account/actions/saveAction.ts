"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import * as accountService from "@/backend/accountService";
import { canEdit } from "@/shared/roleUtils";
import { getServerSession } from "next-auth";

export default async function saveUsername(username: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw "You must login to save changes";
  }

  if (!canEdit(session.user.role)) {
    throw "You do not have permission to edit";
  }

  await accountService.saveUsername(session.user.id, username);
}
