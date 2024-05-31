import { ListSearchParms, getBaseFindParams } from "./listHelper";
import prisma from "@/database/prisma";

export async function getTagsList(
  categoryId: number,
  searchParams: ListSearchParms,
) {
  const baseFindParams = getBaseFindParams(searchParams);

  if (baseFindParams.where) {
    baseFindParams.where.tag_category_id = categoryId;
  } else {
    baseFindParams.where = {
      tag_category_id: categoryId,
    };
  }

  const list = await prisma.tag.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.tag.count();

  return { list, count };
}
