import { SKETCH_PAGE_SIZE, SketchGridData } from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";

export async function getSeasonsList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.season.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
    },
  });

  const count = await prisma.season.count();

  return { list, count };
}

export async function getSeason(id: number) {
  return prisma.season.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      url_slug: true,
      year: true,
      number: true,
      show: {
        select: {
          id: true,
          url_slug: true,
          title: true,
        },
      },
      episodes: {
        select: {
          id: true,
          url_slug: true,
          number: true,
          air_date: true,
          _count: {
            select: {
              sketches: true,
            },
          },
        },
        orderBy: {
          number: "asc",
        },
      },
    },
  });
}

export async function getSeasonSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch.findMany({
    where: {
      season_id: id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      site_rating: true,
      image: {
        select: {
          cdn_key: true,
        },
      },
      season: {
        select: {
          year: true,
        },
      },
    },
    orderBy: {
      site_rating: "desc",
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const totalCount = await prisma.sketch.count({
    where: {
      season_id: id,
    },
  });

  const sketches = dbResults.map((s) => ({
    id: s.id,
    url_slug: s.url_slug,
    site_rating: s.site_rating,
    title: s.title,
    subtitle: s.season?.year.toString(),
    image_cdnkey: s.image?.cdn_key,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
