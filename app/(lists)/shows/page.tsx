import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getShowsList } from "@/backend/content/showService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import ShowsDataGrid from "./ShowsDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Shows"),
  description: "A filterable list of sketch comedy shows",
};

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const shows = await getCachedList("show", getShowsList)(searchParams);

  const rows = shows.list.map((show) => ({
    id: show.id,
    title: show.title,
    url_slug: show.url_slug,
    sketches___count: show._count.sketches,
  }));

  // Rendering
  return (
    <>
      <ShowsDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={shows.count}
      />
      <DateGeneratedFooter genDate={shows.dateGenerated} type="data" />
    </>
  );
}
