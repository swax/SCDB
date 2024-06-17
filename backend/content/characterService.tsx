import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  selectSketch,
} from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getCharacterList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.character.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
      _count: {
        select: {
          sketch_casts: true,
        },
      },
    },
  });

  const count = await prisma.character.count();

  return { list, count, dateGenerated: new Date() };
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
      link_urls: true,
      person: {
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
          id: true,
          url_slug: true,
        },
      },
      sketch: {
        select: {
          ...selectSketch,
        },
      },
      image: {
        select: {
          cdn_key: true,
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

  const totalCount = await prisma.sketch_cast.count({
    where: {
      character_id: id,
    },
  });

  const sketches = dbResults.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    site_rating: sc.sketch.site_rating,
    titleString: sc.sketch.title,
    title: <ContentLink table="sketch" entry={sc.sketch} />,
    subtitle: (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {!!sc.person && (
          <span>
            <ContentLink table="person" entry={sc.person} />
            {"\u00A0•\u00A0"}
          </span>
        )}
        <span>
          <ContentLink table="show" entry={sc.sketch.show} />{" "}
          {!!sc.sketch.season && (
            <>
              {"("}
              <ContentLink table="season" entry={sc.sketch.season} />
              {")"}
            </>
          )}
        </span>
      </div>
    ),
    image_cdnkey: sc.image?.cdn_key || sc.sketch.image?.cdn_key,
    video_urls: sc.sketch.video_urls,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
