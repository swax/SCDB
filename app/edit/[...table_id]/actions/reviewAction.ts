"use server";

import {
  catchServiceErrors,
  getLoggedInUser,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import { TableCms } from "@/backend/cms/cmsTypes";
import prisma from "@/database/prisma";
import { review_status_type, user_role_type } from "@/shared/enums";

export async function updateReviewStatus(
  table: TableCms,
  id: number,
  reviewStatus: review_status_type,
  flagNote?: string,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    validateRoleAtLeast(user.role, user_role_type.Moderator);

    // Validate flag note requirement
    if (reviewStatus === review_status_type.Flagged && !flagNote?.trim()) {
      throw new Error("Flag note is required when flagging an item");
    }

    const dynamicPrisma = prisma as any;

    // Get the last modified by user
    const row = await dynamicPrisma[table.name].findUnique({
      where: {
        id: id,
      },
      select: {
        modified_by_id: true,
      },
    });

    /* Prevent the user from reviewing their own changes
    if (
      reviewStatus == review_status_type.Reviewed &&
      row.modified_by_id == user.id
    ) {
      throw new Error("You cannot review your own changes");
    }*/

    // Make the change
    await dynamicPrisma[table.name].update({
      where: {
        id: id,
      },
      data: {
        review_status: reviewStatus,
        // Don't change note in needs review status, set to null if reviewed, set to note if flagged
        flag_note:
          reviewStatus === review_status_type.NeedsReview
            ? undefined
            : reviewStatus === review_status_type.Flagged
              ? flagNote
              : null,
        modified_by_id: user.id,
        modified_at: new Date(),
      },
    });
  });
}
