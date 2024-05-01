"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TableOrm } from "@/database/orm/ormTypes";
import { canEdit } from "@/shared/roleUtils";
import { errorResponse } from "@/shared/serviceResponse";
import { getServerSession } from "next-auth";

export default async function editAction(table: TableOrm, id: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return errorResponse("You must login to save changes");
  }

  if (!canEdit(session.user.role)) {
    return errorResponse("You do not have permission to edit");
  }

  return await writeFieldValues(session.user.id, table, id);
}
