import { StringFieldCms } from "@/backend/cms/cmsTypes";
import prisma from "@/database/prisma";
import { allowedToChangeRole, getRoleRank } from "@/shared/roleUtils";
import { operation_type, user_role_type } from "@prisma/client";
import { SessionUser } from "next-auth";
import { getAccount } from "../user/accountService";

export async function saveRole(
  sessionUser: SessionUser,
  userId: string,
  newRole: user_role_type,
) {
  if (sessionUser.id === userId) {
    throw new Error("Cannot change your own role");
  }

  const userAccount = await getAccount(userId);
  if (!userAccount) {
    throw new Error("User account not found");
  }

  const currentUserRole = userAccount.role;

  if (!allowedToChangeRole(currentUserRole, sessionUser.role)) {
    throw new Error(
      `Unable to change a ${currentUserRole}'s role when your role is ${sessionUser.role}`,
    );
  }

  // New role must be less than your role
  if (getRoleRank(newRole) >= getRoleRank(sessionUser.role)) {
    throw new Error(
      "You cannot change a user's role to a role equal to or higher than your own",
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: newRole,
      modified_by_id: sessionUser.id,
      modified_at: new Date(),
    },
  });

  // Create audit entry
  await prisma.audit.create({
    data: {
      changed_by_id: sessionUser.id,
      operation: operation_type.UPDATE,
      table_name: "user",
      row_id: userId.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "role",
          values: [newRole],
        },
      ] satisfies StringFieldCms[],
    },
  });
}

export async function saveModNote(
  sessionUser: SessionUser,
  userId: string,
  modNote: string,
) {
  const userAccount = await getAccount(userId);
  if (!userAccount) {
    throw new Error("User account not found");
  }

  const currentUserRole = userAccount.role;

  if (!allowedToChangeRole(currentUserRole, sessionUser.role)) {
    throw new Error(
      `Unable to change a ${currentUserRole}'s mod note when your role is ${sessionUser.role}`,
    );
  }

  if (userId == sessionUser.id) {
    throw new Error("Cannot change your own mod note");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mod_note: modNote,
      modified_by_id: sessionUser.id,
      modified_at: new Date(),
    },
  });

  // Create audit entry
  await prisma.audit.create({
    data: {
      changed_by_id: sessionUser.id,
      operation: operation_type.UPDATE,
      table_name: "user",
      row_id: userId.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "mod_note",
          values: [modNote],
        },
      ] satisfies StringFieldCms[],
    },
  });
}
