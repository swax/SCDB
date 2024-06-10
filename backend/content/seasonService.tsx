import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  selectSketch,
} from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";
import { ContentLink } from "@/app/components/ContentLink";

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
      link_urls: true,
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
      ...selectSketch,
      episode: {
        select: {
          number: true,
          air_date: true,
          id: true,
          url_slug: true,
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
    titleString: s.title,
    title: <ContentLink table="sketch" entry={s} />,
    subtitle: s.episode ? (
      <ContentLink table="episode" entry={s.episode}>
        {s.episode.air_date
          ? s.episode.air_date.toLocaleDateString()
          : "Episode " + s.episode.number}
      </ContentLink>
    ) : (
      <></>
    ),
    image_cdnkey: s.image?.cdn_key,
    video_urls: s.video_urls,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
