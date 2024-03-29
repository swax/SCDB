import prisma from "@/database/prisma";

export interface ISketch {
  id: number;
  title: string;
  teaser: Nullable<string>;
  description: Nullable<string>;
  show: {
    name: string;
  };
  episode: Nullable<{
    season: {
      year: number;
    };
  }>;
}
export async function getSketch(id: number) {
  const result: Nullable<ISketch> = await prisma.sketch.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      teaser: true,
      description: true,
      show: {
        select: {
          name: true,
        },
      },
      episode: {
        select: {
          season: {
            select: {
              year: true,
            },
          },
        },
      },
    },
  });

  return result;
}
