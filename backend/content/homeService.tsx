import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import { SketchGridData, selectSketch } from "@/shared/sketchGridBase";

const SKETCH_PAGE_SIZE = 6;

export async function getLatestSketchGrid(
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch.findMany({
    select: {
      ...selectSketch,
    },
    orderBy: {
      id: "desc",
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const sketches = dbResults.map((s) => ({
    id: s.id,
    url_slug: s.url_slug,
    site_rating: s.site_rating,
    titleString: s.title,
    title: <ContentLink table="sketch" entry={s} />,
    subtitle: (
      <>
        <ContentLink table="show" entry={s.show} />{" "}
        {!!s.season && (
          <>
            {"("}
            <ContentLink table="season" entry={s.season} />
            {")"}
          </>
        )}
      </>
    ),
    image_cdnkey: s.image?.cdn_key,
    video_urls: s.video_urls,
  }));

  return {
    sketches,
    totalCount: -1,
    totalPages: -1,
  };
}

export async function getTrendingSketchGrid(
  page: number,
): Promise<SketchGridData> {
  const gteModifiedAt = await prisma.sketch_rating.findFirst({
    select: {
      modified_at: true,
    },
    orderBy: {
      modified_at: "desc",
    },
    skip: 50,
  });

  const whereFilter = gteModifiedAt
    ? {
        modified_at: {
          gte: gteModifiedAt.modified_at,
        },
      }
    : {};

  const trendingSketchIds = await prisma.sketch_rating.groupBy({
    by: ["sketch_id"],
    _count: {
      rating_value: true,
    },
    _sum: {
      rating_value: true,
    },
    where: {
      ...whereFilter,
    },
    orderBy: {
      _sum: {
        rating_value: "desc",
      },
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const dbResults = await prisma.sketch.findMany({
    where: {
      id: {
        in: trendingSketchIds.map((s) => s.sketch_id),
      },
    },
    select: {
      ...selectSketch,
    },
    orderBy: {
      id: "desc",
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const sketches = dbResults.map((s) => ({
    id: s.id,
    url_slug: s.url_slug,
    site_rating: s.site_rating,
    titleString: s.title,
    title: <ContentLink table="sketch" entry={s} />,
    subtitle: (
      <>
        <ContentLink table="show" entry={s.show} />{" "}
        {!!s.season && (
          <>
            {"("}
            <ContentLink table="season" entry={s.season} />
            {")"}
          </>
        )}
      </>
    ),
    image_cdnkey: s.image?.cdn_key,
    video_urls: s.video_urls,
  }));

  return {
    sketches,
    totalCount: -1,
    totalPages: -1,
  };
}
