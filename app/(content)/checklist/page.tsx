import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getChecklistList } from "@/backend/content/checklistService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import ChecklistDataGrid from "./ChecklistDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Checklist"),
  description: "A checklist of sketches to add",
};

export default async function ChecklistPage(props: ListPageProps) {
  const searchParams = await parseSearchParams(props.searchParams);

  const checklist = await getCachedList(
    "checklist",
    (params) => getChecklistList(params),
  )(searchParams);

  const rows = checklist.list.map((item) => ({
    id: item.id,
    sketch_title: item.sketch_title,
    status: item.status,
    notes: item.notes,
    sketch_id: item.sketch_id,
    show__title: item.show.title,
    season__year: item.season?.year,
    episode__number: item.episode?.number,
  }));

  return (
    <>
      <ChecklistDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={checklist.count}
      />
      <DateGeneratedFooter genDate={checklist.dateGenerated} type="data" />
    </>
  );
}
