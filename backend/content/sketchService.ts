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
      },
      sketch_casts: {
        select: {
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
      },
    },
  });

  return result;
}