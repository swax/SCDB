import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getRecurringSketchList } from "@/backend/content/recurringSketch";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import RecurringSketchesDataGrid from "./RecurringSketchesDataGrid";
import { buildPageTitle } from "@/shared/utilities";

export default async function RecurringSketchesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const recurringSketches = await getCachedList(
    "recurring-sketch",
    getRecurringSketchList,
  )(searchParams);

  const rows = recurringSketches.list.map((recurringSketch) => ({
    id: recurringSketch.id,
    title: recurringSketch.title,
    url_slug: recurringSketch.url_slug,
    sketches___count: recurringSketch._count.sketches,
  }));

  // Rendering
  const pageTitle = buildPageTitle("Recurring Sketches");

  return (
    <>
      <title>{pageTitle}</title>
      <RecurringSketchesDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={recurringSketches.count}
      />
      <DateGeneratedFooter
        genDate={recurringSketches.dateGenerated}
        type="data"
      />
    </>
  );
}
