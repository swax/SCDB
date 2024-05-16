import prisma from "@/database/prisma";

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

  return result;
}
