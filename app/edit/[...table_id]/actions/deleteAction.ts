"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { canEdit } from "@/shared/roleUtils";
import { getServerSession } from "next-auth";

export default async function deleteAction(table: TableOrm, id: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw "You must login to save changes";
  }

  if (!canEdit(session.user.role)) {
    throw "You do not have permission to edit";
  }

  return await deleteRow(session.user.id, table, id);
}
