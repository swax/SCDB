import prisma from "@/database/prisma";
import { $Enums } from "@prisma/client";

export interface GetProfileResponse {
  id: string;
  username: string;
  role: $Enums.user_role_type;
}

export async function getProfile(username: string) {
  return (await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      role: true,
    },
  })) satisfies GetProfileResponse | null;
}
