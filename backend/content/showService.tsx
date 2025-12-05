import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  selectSketch,
} from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";
import { ContentLink } from "@/app/components/ContentLink";

export async function getShowsList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams, ["title"]);

  const list = await prisma.show.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      title: true,
      _count: {
        select: {
          sketches: true,
        },
      },
    },
  });

  const count = await prisma.show.count({
    where: baseFindParams.where,
  });

  return { list, count, dateGenerated: new Date() };
}

export async function getShow(id: number) {
  return prisma.show.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      link_urls: true,
      description: true,
      seasons: {
        select: {
          id: true,
          url_slug: true,
          year: true,
          number: true,
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

export async function getShowSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch.findMany({
    where: {
      show_id: id,
    },
    select: {
      ...selectSketch,
    },
    orderBy: {
      site_rating: "desc",
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const totalCount = await prisma.sketch.count({
    where: {
      show_id: id,
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
    video_urls: s.video_urls,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
