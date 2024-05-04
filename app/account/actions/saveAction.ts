"use server";

import * as accountService from "@/backend/accountService";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";

export default async function saveUsername(username: string) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    await accountService.saveUsername(user.id, username);
  });
}
