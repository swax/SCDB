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
      person: {
        select: {
          id: true,
          url_slug: true,
        },
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

export async function getCharacterSketches(
  id: number,
  skip?: number,
  take?: number,
) {
  const list = await prisma.sketch_cast.findMany({
    where: {
      character_id: id,
    },
    select: {
      person: {
        select: {
          name: true,
        },
      },
      sketch: {
        select: {
          id: true,
          url_slug: true,
          title: true,
          image: {
            select: {
              cdn_key: true,
            },
          },
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
  });

  const totalCount = await prisma.sketch_cast.count({
    where: {
      character_id: id,
    },
  });

  return {
    list,
    totalCount,
  };
}
