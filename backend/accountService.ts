import prisma from "@/database/prisma";

export async function getAccount(id: string) {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });
}

export async function saveUsername(id: string, username: string) {
  await prisma.user.update({
    where: {
      id,
    },
    data: {
      username: username,
      // TODO: Four fields on user table
    },
  });
}
