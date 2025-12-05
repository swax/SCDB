import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  SketchGridSearchOptions,
  selectSketch,
} from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getPersonList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams, ["name"]);

  const dbList = await prisma.person.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
      birth_date: true,
      death_date: true,
      _count: {
        select: {
          sketch_casts: true,
        },
      },
    },
  });

  const count = await prisma.person.count({
    where: baseFindParams.where,
  });

  const list = dbList.map((person) => ({
    ...person,
    age: getAge(person.birth_date, person.death_date),
  }));

  return { list, count, dateGenerated: new Date() };
}

export async function getPerson(id: number) {
  const result = await prisma.person.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      description: true,
      birth_date: true,
      death_date: true,
      link_urls: true,
      character: {
        select: {
          id: true,
          url_slug: true,
          name: true,
        },
      },
      person_images: {
        select: {
          description: true,
          image: {
            select: {
              cdn_key: true,
            },
          },
        },
        orderBy: {
          sequence: "asc",
        },
      },
    },
  });

  if (!result) {
    return null;
  }

  return {
    ...result,
    age: getAge(result.birth_date, result.death_date),
    dateGenerated: new Date(),
  };
}

function getAge(birthDate: Nullable<Date>, deathDate: Nullable<Date>) {
  if (!birthDate) {
    return null;
  }

  const endDate = deathDate || new Date();

  return endDate.getFullYear() - birthDate.getFullYear();
}

export async function getPersonSketchCastGrid(
  id: number,
  page: number,
  options?: SketchGridSearchOptions,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_cast.findMany({
    where: {
      person_id: id,
      minor_role: options?.hideMinorRoles ? false : undefined,
    },
    select: {
      character_name: true,
      character: {
        select: {
          id: true,
          name: true,
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

  // Need to do raw sql here because prisma can't do count(distinct)
  // Also need raw unsafe sql because we can't compose a conditional 'where' clause
  let rawSql = `SELECT COUNT(DISTINCT sketch_id) FROM sketch_cast WHERE person_id = $1`;

  if (options?.hideMinorRoles) {
    rawSql += ` AND minor_role = false`;
  }

  const distinctCount = (await prisma.$queryRawUnsafe(rawSql, id)) as {
    count: number;
  }[];

  const totalCount = Number(distinctCount[0].count);

  const sketches = dbResults.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    site_rating: sc.sketch.site_rating,
    titleString: sc.sketch.title,
    title: <ContentLink table="sketch" entry={sc.sketch} />,
    subtitle: (
      <>
        {sc.character ? (
          <>
            <ContentLink table="character" entry={sc.character} />
          </>
        ) : sc.character_name ? (
          <span>{sc.character_name}</span>
        ) : (
          <></>
        )}
      </>
    ),
    show: (
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
    image_cdnkey: sc.image?.cdn_key || sc.sketch.image?.cdn_key,
    video_urls: sc.sketch.video_urls,
  }));

  // Some people are in a sketch multiple times as different characters, combine them
  const sketchesMap = new Map<number, (typeof sketches)[0]>();

  sketches.forEach((sketch) => {
    const existingSketch = sketchesMap.get(sketch.id);
    if (existingSketch) {
      existingSketch.subtitle = (
        <>
          {existingSketch.subtitle}
          {"\u00A0/\u00A0"}
          {sketch.subtitle}
        </>
      );
    } else {
      sketchesMap.set(sketch.id, sketch);
    }
  });

  // Iterate sketch map and append show to subtitle
  sketchesMap.forEach((sketch) => {
    sketch.subtitle = (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {sketch.subtitle}
        {"\u00A0•\u00A0"}
        <span>{sketch.show}</span>
      </div>
    );
  });

  return {
    sketches: Array.from(sketchesMap.values()).sort(
      (a, b) => (b.site_rating || 0) - (a.site_rating || 0),
    ),
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}

export async function getPersonSketchCreditGrid(
  id: number,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_credit.findMany({
    where: {
      person_id: id,
    },
    select: {
      sketch: {
        select: {
          ...selectSketch,
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

  const totalCount = await prisma.sketch_credit.count({
    where: {
      person_id: id,
    },
  });

  const sketches = dbResults.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    site_rating: sc.sketch.site_rating,
    titleString: sc.sketch.title,
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
    video_urls: sc.sketch.video_urls,
  }));

  return {
    sketches,
    totalCount,
    totalPages: Math.ceil(totalCount / SKETCH_PAGE_SIZE),
  };
}
