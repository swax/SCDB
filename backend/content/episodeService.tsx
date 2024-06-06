import { SKETCH_PAGE_SIZE, SketchGridData } from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";
import { ContentLink } from "@/app/components/ContentLink";

export async function getEpisodesList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.season.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
    },
  });

  const count = await prisma.episode.count();

  return { list, count };
}

export async function getEpisode(id: number) {
  return prisma.episode.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      url_slug: true,
      number: true,
      air_date: true,
      link_urls: true,
      season: {
        select: {
          id: true,
          url_slug: true,
          number: true,
          year: true,
          lookup_slug: true,
          show: {
            select: {
              id: true,
              url_slug: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export async function getEpisodeSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch.findMany({
    where: {
      episode_id: id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      site_rating: true,
      video_urls: true,
      image: {
        select: {
          cdn_key: true,
        },
      },
      season: {
        select: {
          id: true,
          url_slug: true,
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
      episode_id: id,
    },
  });

  const sketches = dbResults.map((s) => ({
    id: s.id,
    url_slug: s.url_slug,
    site_rating: s.site_rating,
    titleString: s.title,
    title: <ContentLink table="sketch" entry={s} />,
    subtitle: s.season ? (
      <ContentLink table="season" entry={s.season} />
    ) : (
      <></>
    ),
    image_cdnkey: s.image?.cdn_key,
    video_urls: s.video_urls
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
