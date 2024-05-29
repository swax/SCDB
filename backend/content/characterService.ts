import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import { SKETCH_PAGE_SIZE, SketchGridData } from "@/shared/sketchGridBase";

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

export async function getCharacterSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_cast.findMany({
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
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const totalCount = await prisma.sketch_cast.count({
    where: {
      character_id: id,
    },
  });

  const sketches = dbResults.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    title: sc.sketch.title,
    subtitle: `${sc.person?.name} • ${sc.sketch.show.title} (${sc.sketch.season?.year})`,
    image_cdnkey: sc.image?.cdn_key || sc.sketch.image?.cdn_key,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
