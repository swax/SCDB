import { getShowsList } from "@/backend/content/showService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import ShowsDataGrid from "./ShowsDataGrid";

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const shows = await getShowsList(searchParams);

  const rows = shows.list.map((show) => ({
    id: show.id,
    title: show.title,
    url_slug: show.url_slug,
    sketches___count: show._count.sketches,
  }));

  // Rendering
  return (
    <ShowsDataGrid
      searchParams={searchParams}
      rows={rows}
      totalRowCount={shows.count}
    />
  );
}
