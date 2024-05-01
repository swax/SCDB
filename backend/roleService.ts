import { StringFieldOrm } from "@/database/orm/ormTypes";
import prisma from "@/database/prisma";
import { allowedToChangeRole, roleRank } from "@/shared/roleUtils";
import { emptyResponse, errorResponse } from "@/shared/serviceResponse";
import { $Enums, operation_type } from "@prisma/client";
import { getAccount } from "./accountService";

export async function saveRole(
  sessionUserId: string,
  userId: string,
  newRole: $Enums.user_role_type,
) {
  if (sessionUserId === userId) {
    return errorResponse("Cannot change your own role");
  }

  const sessionAccount = await getAccount(sessionUserId);
  if (!sessionAccount) {
    return errorResponse("Session user account not found");
  }

  const userAccount = await getAccount(userId);
  if (!userAccount) {
    return errorResponse("User account not found");
  }

  const currentUserRole = userAccount.role;

  if (!allowedToChangeRole(currentUserRole, sessionAccount.role)) {
    return errorResponse(
      `Unable to change a ${currentUserRole}'s role when your role is ${sessionAccount.role}`,
    );
  }

  // New role must be less than your role
  if (roleRank(newRole) >= roleRank(sessionAccount.role)) {
    return errorResponse(
      "You cannot change a user's role to a role equal to or higher than your own",
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      modified_by_id: sessionUserId,
      modified_at: new Date(),
    },
  });

  // Create audit entry
  await prisma.audit.create({
    data: {
      changed_by_id: sessionUserId,
      operation: operation_type.UPDATE,
      table_name: "user",
      row_id: sessionUserId.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "role",
          values: [newRole],
        },
      ] satisfies StringFieldOrm[],
    },
  });

  return emptyResponse();
}
