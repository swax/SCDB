import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getCharacterList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.character.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.character.count();

  return { list, count };
}

export async function getCharacter(id: number, skip?: number, take?: number) {
  skip ||= 0;
  take ||= 10;

  const result = await prisma.character.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      description: true,
      person_id: true,
      sketch_casts: {
        select: {
          role: true,
          description: true,
          sketch: {
            select: {
              id: true,
              title: true,
              url_slug: true,
              show: {
                select: {
                  title: true,
                },
              },
              season: {
                select: {
                  year: true,
                },
              },
              sketch_images: {
                select: {
                  image: {
                    select: {
                      cdn_key: true,
                    },
                  },
                },
                take: 1,
              },
            },
          },
          person: {
            select: {
              id: true,
              name: true,
              url_slug: true,
            },
          },
          image: {
            select: {
              cdn_key: true,
            },
          },
        },
        skip,
        take,
      },
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
