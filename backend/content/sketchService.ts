import prisma from "@/database/prisma";

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
              name: true,
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
