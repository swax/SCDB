"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { getServerSession } from "next-auth";

export default async function editAction(table: TableOrm, id: number) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw "You must login to save changes";
  }

  return await writeFieldValues(session.user.id, table, id);
}
