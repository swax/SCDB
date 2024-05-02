"use server";

import * as accountService from "@/backend/accountService";
import { catchServiceErrors, validateLoggedIn } from "@/backend/actionHelper";

export default async function saveUsername(username: string) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    await accountService.saveUsername(session.user.id, username);
  });
}
