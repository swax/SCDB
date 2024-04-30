"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import * as accountService from "@/backend/accountService";
import { getServerSession } from "next-auth";

export default async function saveUsername(username: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw "You must login to save changes";
  }

  await accountService.saveUsername(session.user.id, username);
}
