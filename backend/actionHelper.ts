import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { canEdit } from "@/shared/roleUtils";
import {
    ServiceResponse,
    emptyResponse,
    errorResponse,
} from "@/shared/serviceResponse";
import { user_role_type } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function validateLoggedIn() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw "You must login to save changes";
  }

  return session;
}

export function validateCanEdit(role: user_role_type) {
  if (!canEdit(role)) {
    throw "You do not have permission to edit";
  }
}

export async function catchServiceErrors<T>(
  runService: () => Promise<ServiceResponse<T> | void>,
): Promise<ServiceResponse<T | void>> {
  try {
    const response = await runService();

    return response || emptyResponse();
  } catch (e) {
    return errorResponse(`${e}`);
  }
}
