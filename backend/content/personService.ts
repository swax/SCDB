import prisma from "@/database/prisma";
import { ListSearchParms, getBaseFindParams } from "./listHelper";

export async function getPersonList(searchParams: ListSearchParms) {
  const baseFindParams = getBaseFindParams(searchParams);

  const findParams = {
    ...baseFindParams,
    select: {
      id: true,
      url_slug: true,
      name: true,
      birth_date: true,
      death_date: true,
    },
  };

  const dbList = await prisma.person.findMany(findParams);

  const count = await prisma.person.count();

  const list = dbList.map((person) => ({
    ...person,
    age: getAge(person.birth_date, person.death_date),
  }));

  return { list, count };
}

export async function getPerson(id: number) {
  const result = await prisma.person.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      url_slug: true,
      name: true,
      description: true,
      birth_date: true,
      death_date: true,
      person_images: {
        select: {
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

  if (!result) {
    return null;
  }

  return {
    ...result,
    age: getAge(result.birth_date, result.death_date),
    dateGenerated: new Date(),
  };
}

function getAge(birthDate: Nullable<Date>, deathDate: Nullable<Date>) {
  if (!birthDate) {
    return null;
  }

  const endDate = deathDate || new Date();

  return endDate.getFullYear() - birthDate.getFullYear();
}
