"use server";

import {
  catchServiceErrors,
  getLoggedInUser,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import { TableCms } from "@/backend/cms/cmsTypes";
import { review_status_type, user_role_type } from "@prisma/client";

export async function updateReviewStatus(
  table: TableCms,
  id: number,
  reviewStatus: review_status_type,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    validateRoleAtLeast(user.role, user_role_type.Moderator);

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

    // Prevent the user from reviewing their own changes
    if (
      reviewStatus == review_status_type.Reviewed &&
      row.modified_by_id == user.id
    ) {
      throw "You cannot review your own changes";
    }

    // Make the change
    await dynamicPrisma[table.name].update({
      where: {
        id: id,
      },
      data: {
        review_status: reviewStatus,
        modified_by_id: user.id,
        modified_at: new Date(),
      },
    });
  });
}
