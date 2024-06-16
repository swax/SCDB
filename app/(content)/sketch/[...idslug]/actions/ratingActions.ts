"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import * as sketchService from "@/backend/content/sketchService";

export async function saveRating(sketchId: number, rating: number | null) {
  return catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    const response = sketchService.saveRating(user.id, sketchId, rating);

    revalidateContent("sketch", sketchId); // Revalidates page cache so the updated rating will show

    return response;
  });
}

export async function getRating(sketchId: number) {
  return catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    return sketchService.getRating(user.id, sketchId);
  });
}
