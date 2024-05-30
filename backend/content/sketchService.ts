import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";
import { contentResponse } from "@/shared/serviceResponse";

export async function getSketchList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.sketch.findMany({
    ...baseFindParams,
    select: {
      id: true,
      title: true,
      url_slug: true,
      show: {
        select: {
          title: true,
        },
      },
      season: {
        select: {
          year: true,
        },
      },
      created_at: true,
    },
  });

  // get total count
  const count = await prisma.sketch.count();

  return { list, count };
}

export async function getSketch(id: number) {
  const result = await prisma.sketch.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      description: true,
      site_rating: true,
      image: {
        select: {
          cdn_key: true,
        },
      },
      video_urls: true,
      show: {
        select: {
          title: true,
        },
      },
      season: {
        select: {
          year: true,
          number: true,
        },
      },
      episode: {
        select: {
          number: true,
        },
      },
      sketch_tags: {
        select: {
          tag: {
            select: {
              name: true,
              tag_category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          sequence: "asc",
        },
      },
      sketch_casts: {
        select: {
          character_name: true,
          character: {
            select: {
              name: true,
              id: true,
              url_slug: true,
            },
          },
          person: {
            select: {
              id: true,
              name: true,
              url_slug: true,
            },
          },
          role: true,
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
    dateGenerated: new Date(),
  };
}

export async function saveRating(
  userId: string,
  sketchId: number,
  rating: number | null,
) {
  await prisma.sketch_rating.upsert({
    where: {
      user_id_sketch_id: {
        user_id: userId,
        sketch_id: sketchId,
      },
    },
    update: {
      rating_value: rating,
      modified_by_id: userId,
      modified_at: new Date(),
    },
    create: {
      user_id: userId,
      sketch_id: sketchId,
      rating_value: rating,
      modified_by_id: userId,
      modified_at: new Date(),
    },
  });

  return await getRating(userId, sketchId);
}

export async function getRating(userId: string, sketchId: number) {
  const userRating = await prisma.sketch_rating.findUnique({
    where: {
      user_id_sketch_id: {
        user_id: userId,
        sketch_id: sketchId,
      },
    },
    select: {
      rating_value: true,
    },
  });

  const sketchRating = await prisma.sketch.findUnique({
    where: {
      id: sketchId,
    },
    select: {
      site_rating: true,
    },
  });

  return contentResponse({
    userRating: userRating?.rating_value || null,
    siteRating: sketchRating?.site_rating || null,
  });
}
