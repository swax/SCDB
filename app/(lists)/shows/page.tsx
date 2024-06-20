import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getShowsList } from "@/backend/content/showService";
import { buildPageTitle } from "@/shared/utilities";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import ShowsDataGrid from "./ShowsDataGrid";

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
  const pageTitle = buildPageTitle("Shows");

  return (
    <>
      <title>{pageTitle}</title>
      <ShowsDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={shows.count}
      />
      <DateGeneratedFooter dataDate={shows.dateGenerated} />
    </>
  );
}
