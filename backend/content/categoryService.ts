import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";

export async function getCategoriesList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.category.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
      _count: {
        select: {
          tags: true,
        },
      },
    },
  });

  const count = await prisma.category.count();

  return { list, count, dateGenerated: new Date() };
}

export async function getCategory(id: number) {
  const result = await prisma.category.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
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
