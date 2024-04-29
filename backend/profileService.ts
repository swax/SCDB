import prisma from "@/database/prisma";

export async function getProfile(username: string) {
  return await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
}
