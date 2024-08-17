import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import ProcessEnv from "@/shared/ProcessEnv";
import { getRoleRank } from "@/shared/roleUtils";
import {
  ServiceResponse,
  emptyResponse,
  errorResponse,
} from "@/shared/serviceResponse";
import { user_role_type } from "@prisma/client";
import { getServerSession } from "next-auth";
import "server-only"; // Helps prevent forgetting to mark files as "use server", by blowing up when included client side

export async function getLoggedInUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("You must login to save changes");
  }

  return session.user;
}

export function validateRoleAtLeast(
  role: user_role_type,
  minRole: user_role_type,
) {
  const roleRank = getRoleRank(role);

  if (roleRank < getRoleRank(minRole)) {
    throw new Error(`You must have at least ${minRole} permission`);
  }

  if (
    ProcessEnv.MIN_EDIT_ROLE &&
    roleRank < getRoleRank(ProcessEnv.MIN_EDIT_ROLE)
  ) {
    throw new Error(
      `Min role to edit set by server is currently ${ProcessEnv.MIN_EDIT_ROLE}. This may be temporary.`,
    );
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
