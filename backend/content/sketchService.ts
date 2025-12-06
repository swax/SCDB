import prisma from "@/database/prisma";
import { contentResponse } from "@/shared/serviceResponse";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getSketchList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams, ["title"]);

  const list = await prisma.sketch.findMany({
    ...baseFindParams,
    select: {
      id: true,
      title: true,
      url_slug: true,
      site_rating: true,
      posted_on_socials: true,
      review_status: true,
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
  const count = await prisma.sketch.count({
    where: baseFindParams.where,
  });

  return { list, count, dateGenerated: new Date() };
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
      teaser: true,
      synopsis: true,
      notes: true,
      link_urls: true,
      site_rating: true,
      image: {
        select: {
          cdn_key: true,
        },
      },
      video_urls: true,
      show: {
        select: {
          id: true,
          url_slug: true,
          title: true,
        },
      },
      season: {
        select: {
          id: true,
          url_slug: true,
          year: true,
          number: true,
        },
      },
      episode: {
        select: {
          id: true,
          url_slug: true,
          number: true,
          air_date: true,
        },
      },
      recurring_sketch: {
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
      },
      sketch_quotes: {
        select: {
          quote: true,
        },
        orderBy: {
          sequence: "asc",
        },
      },
      sketch_tags: {
        select: {
          tag: {
            select: {
              id: true,
              url_slug: true,
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
              _count: {
                select: {
                  sketch_tags: true,
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
      sketch_credits: {
        select: {
          person: {
            select: {
              id: true,
              name: true,
              url_slug: true,
              person_images: {
                select: {
                  image: {
                    select: {
                      cdn_key: true,
                    },
                  },
                },
                orderBy: {
                  sequence: "asc",
                },
                take: 1,
              },
            },
          },
          role: true,
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

export async function getSketchSitemap() {
  // Get sketch count
  const count = await prisma.sketch.count();

  if (count > 50_000) {
    throw new Error(
      "Google has a 50,000 url sitemap limit, we need to implement multiple sitemaps",
    );
  }

  // Get all the sketch urls
  const list = await prisma.sketch.findMany({
    select: {
      id: true,
      url_slug: true,
      // Not perfect as mapping changes aren't counted, and rating changes are counted
      modified_at: true,
    },
  });

  return list.map((sketch) => ({
    url: `https://www.sketchtv.lol/sketch/${sketch.id}/${sketch.url_slug}`,
    lastModified: sketch.modified_at.toISOString().split("T")[0],
  }));
}
