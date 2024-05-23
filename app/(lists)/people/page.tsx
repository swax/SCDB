import { getPersonList } from "@/backend/content/personService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import PeopleDataGrid from "./PeopleDataGrid";

export default async function PeoplePage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const people = await getPersonList(searchParams);

  const rows = people.list.map((person) => ({
    id: person.id,
    name: person.name,
    age: person.age,
    birth_date: person.birth_date,
    death_date: person.death_date,
    url_slug: person.url_slug,
  }));

  // Rendering
  return (
    <PeopleDataGrid
      searchParams={searchParams}
      rows={rows}
      totalRowCount={people.count}
    />
  );
}
