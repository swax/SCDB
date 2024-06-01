import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";
import { SKETCH_PAGE_SIZE, SketchGridData } from "@/shared/sketchGridBase";

export async function getTagsList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.tag.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.tag.count();

  return { list, count };
}

export async function getTagsByCategoryList(
  categoryId: number,
  searchParams: ListSearchParms,
) {
  const baseFindParams = getBaseFindParams(searchParams);

  if (baseFindParams.where) {
    baseFindParams.where.category_id = categoryId;
  } else {
    baseFindParams.where = {
      category_id: categoryId,
    };
  }

  const list = await prisma.tag.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.tag.count();

  return { list, count };
}

export async function getTag(id: number) {
  const result = await prisma.tag.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      category: {
        select: {
          id: true,
          url_slug: true,
          name: true,
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

export async function getTagSketchGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_tag.findMany({
    where: {
      tag_id: id,
    },
    select: {
      sketch: {
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
          show: {
            select: {
              title: true,
              id: true,
              url_slug: true,
            },
          },
          season: {
            select: {
              year: true,
              id: true,
              url_slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      sketch: {
        site_rating: "desc",
      },
    },
    skip: (page - 1) * SKETCH_PAGE_SIZE,
    take: SKETCH_PAGE_SIZE,
  });

  const totalCount = await prisma.sketch_tag.count({
    where: {
      tag_id: id,
    },
  });

  const sketches = dbResults.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    site_rating: sc.sketch.site_rating,
    title: <ContentLink table="sketch" entry={sc.sketch} />,
    subtitle: (
      <>
        <ContentLink table="show" entry={sc.sketch.show} />{" "}
        {!!sc.sketch.season && (
          <>
            {"("}
            <ContentLink table="season" entry={sc.sketch.season} />
            {")"}
          </>
        )}
      </>
    ),
    image_cdnkey: sc.sketch.image?.cdn_key,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
