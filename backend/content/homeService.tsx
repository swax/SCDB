import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import { SketchGridData, selectSketch } from "@/shared/sketchGridBase";

const SKETCH_PAGE_SIZE = 6;

export interface UpcomingBirthday {
  id: number;
  name: string;
  url_slug: string;
  birth_date: Date;
  image_cdnkey: string | null;
  isBirthdayToday: boolean;
  cast_images: string[];
}

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

export async function getUpcomingBirthdays(): Promise<UpcomingBirthday[]> {
  // Get people with birthdays, calculating the next occurrence of their birthday
  const results = await prisma.$queryRaw<
    Array<{
      id: number;
      name: string;
      url_slug: string;
      birth_date: Date;
      image_cdnkey: string | null;
      days_until: number;
      cast_images: string;
    }>
  >`
    WITH person_with_next_birthday AS (
      SELECT
        p.id,
        p.name,
        p.url_slug,
        p.birth_date,
        i.cdn_key as image_cdnkey,
        -- Calculate days until next birthday
        CASE
          WHEN EXTRACT(MONTH FROM p.birth_date) > EXTRACT(MONTH FROM CURRENT_DATE)
            OR (EXTRACT(MONTH FROM p.birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(DAY FROM p.birth_date) >= EXTRACT(DAY FROM CURRENT_DATE))
          THEN
            -- Birthday is later this year
            DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' ||
                 EXTRACT(MONTH FROM p.birth_date) || '-' ||
                 EXTRACT(DAY FROM p.birth_date)) - CURRENT_DATE
          ELSE
            -- Birthday is next year
            DATE((EXTRACT(YEAR FROM CURRENT_DATE) + 1) || '-' ||
                 EXTRACT(MONTH FROM p.birth_date) || '-' ||
                 EXTRACT(DAY FROM p.birth_date)) - CURRENT_DATE
        END as days_until
      FROM person p
      LEFT JOIN person_image pi ON p.id = pi.person_id AND pi.sequence = 1
      LEFT JOIN image i ON pi.image_id = i.id
      WHERE p.birth_date IS NOT NULL
    ),
    person_cast_images AS (
      SELECT
        p.id,
        COALESCE(
          STRING_AGG(DISTINCT ci.cdn_key, ',' ORDER BY ci.cdn_key),
          ''
        ) as cast_images
      FROM person_with_next_birthday p
      LEFT JOIN sketch_cast sc ON p.id = sc.person_id AND sc.image_id IS NOT NULL
      LEFT JOIN image ci ON sc.image_id = ci.id
      GROUP BY p.id
    )
    SELECT
      p.*,
      pci.cast_images
    FROM person_with_next_birthday p
    LEFT JOIN person_cast_images pci ON p.id = pci.id
    ORDER BY p.days_until ASC
    LIMIT 5
  `;

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    url_slug: r.url_slug,
    birth_date: r.birth_date,
    image_cdnkey: r.image_cdnkey,
    isBirthdayToday: r.days_until === 0,
    cast_images: r.cast_images ? r.cast_images.split(',').slice(0, 3) : [],
  }));
}
