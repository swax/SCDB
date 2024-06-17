import prisma from "@/database/prisma";
import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  selectSketch,
} from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import { ContentLink } from "@/app/components/ContentLink";

export async function getRecurringSketchList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.recurring_sketch.findMany({
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

  const count = await prisma.recurring_sketch.count();

  return { list, count, dateGenerated: new Date() };
}

export async function getRecurringSketch(id: number) {
  return prisma.recurring_sketch.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      description: true,
      link_urls: true,
    },
  });
}

export async function getRecurringSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch.findMany({
    where: {
      recurring_sketch_id: id,
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
      recurring_sketch_id: id,
    },
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
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
