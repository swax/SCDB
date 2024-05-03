"use server";

import {
  catchServiceErrors,
  validateLoggedIn,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import { TableOrm } from "@/database/orm/ormTypes";
import { review_status_type, user_role_type } from "@prisma/client";

export async function updateReviewStatus(
  table: TableOrm,
  id: number,
  reviewStatus: review_status_type,
) {
  return await catchServiceErrors(async () => {
    const session = await validateLoggedIn();

    validateRoleAtLeast(session.user.role, user_role_type.Moderator);

    const dynamicPrisma = prisma as any;

    await dynamicPrisma[table.name].update({
      where: {
        id: id,
      },
      data: {
        review_status: reviewStatus,
      },
    });
  });
}
