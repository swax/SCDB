import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getChecklistList(
  searchParams: ListSearchParms,
  status?: string,
) {
  const baseFindParams = getBaseFindParams(searchParams, ["sketch_title"]);

  if (status) {
    baseFindParams.where = {
      ...baseFindParams.where,
      status,
    };
  }

  const list = await prisma.checklist.findMany({
    ...baseFindParams,
    select: {
      id: true,
      sketch_title: true,
      status: true,
      video_url: true,
      sketch_id: true,
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
      episode: {
        select: {
          number: true,
        },
      },
      created_at: true,
    },
  });

  const count = await prisma.checklist.count({
    where: baseFindParams.where,
  });

  return { list, count, dateGenerated: new Date() };
}
