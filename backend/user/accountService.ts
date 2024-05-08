import { StringFieldOrm } from "@/database/orm/ormTypes";
import prisma from "@/database/prisma";
import { operation_type } from "@prisma/client";

export async function getAccount(id: string) {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });
}

export async function saveUsername(id: string, username: string) {
  if (!username) {
    throw "Username cannot be empty";
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      username,
      modified_by_id: id,
      modified_at: new Date(),
    },
  });

  // Create audit entry
  await prisma.audit.create({
    data: {
      changed_by_id: id,
      operation: operation_type.UPDATE,
      table_name: "user",
      row_id: id.substring(0, 8),
      modified_fields: [
        {
          type: "string",
          label: "username",
          values: [username],
        },
      ] satisfies StringFieldOrm[],
    },
  });
}
