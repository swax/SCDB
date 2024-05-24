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
