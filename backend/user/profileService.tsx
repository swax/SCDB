import { ContentLink } from "@/app/components/ContentLink";
import prisma from "@/database/prisma";
import {
  SKETCH_PAGE_SIZE,
  SketchGridData,
  selectSketch,
} from "@/shared/sketchGridBase";
import { user_role_type } from "@/shared/enums";

export interface GetProfileResponse {
  id: string;
  username: string;
  role: user_role_type;
  mod_note: string | null;
}

export async function getProfile(
  username: string,
): Promise<GetProfileResponse | null> {
  const profile = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      role: true,
      mod_note: true,
    },
  });

  if (!profile) return null;

  return {
    ...profile,
    role: profile.role as user_role_type,
  };
}

export type ActivityGridRow = {
  sketch_id: number;
  changed_day: Date;
};

export async function getActivityGrid(
  userId: string,
  daysBack: number,
): Promise<ActivityGridRow[]> {
  return await prisma.$queryRaw`
  SELECT * 
  FROM select_activity_grid(${userId}, ${daysBack}::int);
`;
}

export async function getProfileSketchGrid(
  id: string,
  page: number,
): Promise<SketchGridData> {
  const dbResults = await prisma.sketch_rating.findMany({
    where: {
      user_id: id,
      NOT: {
        rating_value: null,
      },
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

  const totalCount = await prisma.sketch_rating.count({
    where: {
      user_id: id,
      NOT: {
        rating_value: null,
      },
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
