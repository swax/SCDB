import { StringFieldOrm } from "@/database/orm/ormTypes";
import prisma from "@/database/prisma";
import { allowedToChangeRole, roleRank } from "@/shared/roleUtils";
import { operation_type, user_role_type } from "@prisma/client";
import { getAccount } from "./accountService";

export async function saveRole(
  sessionUserId: string,
  sessionRole: user_role_type,
  userId: string,
  newRole: user_role_type,
) {
  if (sessionUserId === userId) {
    throw "Cannot change your own role";
  }

  const userAccount = await getAccount(userId);
  if (!userAccount) {
    throw "User account not found";
  }

  const currentUserRole = userAccount.role;

  if (!allowedToChangeRole(currentUserRole, sessionRole)) {
    throw `Unable to change a ${currentUserRole}'s role when your role is ${sessionRole}`;
  }

  // New role must be less than your role
  if (roleRank(newRole) >= roleRank(sessionRole)) {
    throw "You cannot change a user's role to a role equal to or higher than your own";
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
      row_id: userId.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "role",
          values: [newRole],
        },
      ] satisfies StringFieldOrm[],
    },
  });
}

export async function saveModNote(
  sessionUserId: string,
  sessionRole: user_role_type,
  userId: string,
  modNote: string,
) {
  const userAccount = await getAccount(userId);
  if (!userAccount) {
    throw "User account not found";
  }

  const currentUserRole = userAccount.role;

  if (!allowedToChangeRole(currentUserRole, sessionRole)) {
    throw `Unable to change a ${currentUserRole}'s mod note when your role is ${sessionRole}`;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mod_note: modNote,
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
      row_id: userId.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "mod_note",
          values: [modNote],
        },
      ] satisfies StringFieldOrm[],
    },
  });
}
