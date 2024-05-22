import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getCharacterList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const list = await prisma.character.findMany({
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
    },
  });

  const count = await prisma.character.count();

  return { list, count };
}

export async function getCharacter(id: number) {
  const result = await prisma.character.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      description: true,
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
