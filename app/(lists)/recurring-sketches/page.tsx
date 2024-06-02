import { getRecurringSketchList } from "@/backend/content/recurringSketch";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import RecurringSketchesDataGrid from "./RecurringSketchesDataGrid";

export default async function RecurringSketchesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const recurringSketches = await getRecurringSketchList(searchParams);

  const rows = recurringSketches.list.map((recurringSketch) => ({
    id: recurringSketch.id,
    title: recurringSketch.title,
    url_slug: recurringSketch.url_slug,
    sketches___count: recurringSketch._count.sketches,
  }));

  // Rendering
  return (
    <RecurringSketchesDataGrid
      searchParams={searchParams}
      rows={rows}
      totalRowCount={recurringSketches.count}
    />
  );
}
