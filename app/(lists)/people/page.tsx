import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getPersonList } from "@/backend/content/personService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import PeopleDataGrid from "./PeopleDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("People"),
  description: "A filterable list of comedy sketches by person",
};

export default async function PeoplePage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const people = await getCachedList("person", getPersonList)(searchParams);

  const rows = people.list.map((person) => ({
    id: person.id,
    name: person.name,
    age: person.age,
    // Deserialization from the cache leaves the dates as strings
    birth_date: person.birth_date && new Date(person.birth_date),
    death_date: person.death_date && new Date(person.death_date),
    url_slug: person.url_slug,
    sketch_casts___count: person._count.sketch_casts,
  }));

  // Rendering
  return (
    <>
      <PeopleDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={people.count}
      />
      <DateGeneratedFooter genDate={people.dateGenerated} type="data" />
    </>
  );
}
