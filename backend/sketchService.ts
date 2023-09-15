import prisma from "@/database/prisma";

export async function getSketch(id: number) {
  const result = await prisma.sketch.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      teaser: true,
      description: true,
    },
  });

  return result;
}
