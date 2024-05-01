"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteRow } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { canEdit } from "@/shared/roleUtils";
import { emptyResponse, errorResponse } from "@/shared/serviceResponse";
import { getServerSession } from "next-auth";

export default async function deleteAction(table: TableOrm, id: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return errorResponse("You must login to save changes");
  }

  if (!canEdit(session.user.role)) {
    return errorResponse("You do not have permission to edit");
  }

  await deleteRow(session.user.id, table, id);

  return emptyResponse();
}
