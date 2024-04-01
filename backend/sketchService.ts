import prisma from "@/database/prisma";

export interface ISketch {
  id: number;
  title: string;
  tagline: Nullable<string>;
  description: Nullable<string>;
  episode: {
    season: {
      year: number;
      show: {
        title: string;
      };
    };
  };
}
export async function getSketch(id: number) {
  const result: Nullable<ISketch> = await prisma.sketch.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      tagline: true,
      description: true,
      episode: {
        select: {
          season: {
            select: {
              year: true,
              show: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result;
}
