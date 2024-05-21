import prisma from "@/database/prisma";

export async function getPersonList(page: number, pageSize: number) {
  const dbList = await prisma.person.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      url_slug: true,
      name: true,
      birth_date: true,
      death_date: true,
    },
  });

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
