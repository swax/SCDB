import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import { SKETCH_PAGE_SIZE, SketchGridData } from "@/shared/sketchGridBase";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getPersonList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

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

  const count = await prisma.person.count();

  const list = dbList.map((person) => ({
    ...person,
    age: getAge(person.birth_date, person.death_date),
  }));

  return { list, count };
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
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_cast.findMany({
    where: {
      person_id: id,
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
        {!!sc.character ? (
          <>
            <ContentLink table="character" entry={sc.character} />
            {" • "}
          </>
        ) : sc.character_name ? (
          <>{`${sc.character_name} • `}</>
        ) : (
          <></>
        )}
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

  return {
    sketches,
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
