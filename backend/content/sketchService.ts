import prisma from "@/database/prisma";

export async function getSketchList(page: number, rowsPerPage: number) {
  const list = await prisma.sketch.findMany({
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
    orderBy: {
      created_at: "desc",
    },
    skip: (page - 1) * rowsPerPage,
    take: rowsPerPage,
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
      title: true,
      description: true,
      url_slug: true,
      sketch_images: {
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

  return result;
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
}
