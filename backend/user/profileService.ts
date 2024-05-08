import prisma from "@/database/prisma";
import { getRoleRank } from "@/shared/roleUtils";
import { user_role_type } from "@prisma/client";

export interface GetProfileResponse {
  id: string;
  username: string;
  role: user_role_type;
  mod_note: string | null;
}

export async function getProfile(
  username: string,
  sessionRole?: user_role_type,
) {
  return (await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      role: true,
      mod_note:
        sessionRole &&
        getRoleRank(sessionRole) >= getRoleRank(user_role_type.Moderator),
    },
  })) satisfies GetProfileResponse | null;
}
