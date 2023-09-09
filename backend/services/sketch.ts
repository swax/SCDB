import prisma from "@/database/prisma";

export async function getSketch(id: number) {
  const result = await prisma.sketches.findUnique({
    where: {
      sketch_id: id,
    },
    select: {
      sketch_id: true,
      title: true,
      teaser: true,
      description: true,
    },
  });

  return result;
}
