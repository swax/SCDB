"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { getServerSession } from "next-auth";

export default async function deleteAction(table: TableOrm, id: number) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw "You must login to save changes";
  }

  return await deleteRow(session.user.id, table, id);
}
