import prisma from "@/database/prisma";

export async function getCharacterList(page: number, pageSize: number) {
  const list = await prisma.character.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.character.count();

  return { list, count };
}

export async function getCharacter(id: number) {
  const result = await prisma.character.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      description: true,
    },
  });

  if (!result) {
    return null;
  }

  return {
    ...result,
    dateGenerated: new Date(),
  };
}
