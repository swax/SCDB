"use server";

import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import * as sketchService from "@/backend/content/sketchService";

export async function saveRating(sketchId: number, rating: number | null) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    await sketchService.saveRating(user.id, sketchId, rating);
  });
}
