import { getPersonList } from "@/backend/content/personService";
import PeopleDataGrid from "./PeopleDataGrid";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}) {
  // URL params
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "30");

  // Data
  const people = await getPersonList(page, pageSize);

  const rows = people.list.map((person) => ({
    id: person.id,
    name: person.name,
    age: person.age,
    url_slug: person.url_slug,
  }));

  // Rendering
  return (
    <PeopleDataGrid
      page={page - 1}
      pageSize={pageSize}
      rowCount={people.count}
      rows={rows}
    />
  );
}
