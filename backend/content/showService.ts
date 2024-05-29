import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";

export async function getShowsList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.show.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      title: true,
    },
  });

  const count = await prisma.show.count();

  return { list, count };
}

export async function getShow(id: number) {
  return prisma.show.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
    },
  });
}

export async function getShowSketches(
  id: number,
  skip?: number,
  take?: number,
) {
  const list = await prisma.sketch.findMany({
    where: {
      show_id: id,
    },
    select: {
      id: true,
      url_slug: true,
      title: true,
      image: {
        select: {
          cdn_key: true,
        },
      },
      season: {
        select: {
          year: true,
        },
      },
    },
    skip,
    take,
  });

  const totalCount = await prisma.sketch.count({
    where: {
      show_id: id,
    },
  });

  return {
    list,
    totalCount,
  };
}
