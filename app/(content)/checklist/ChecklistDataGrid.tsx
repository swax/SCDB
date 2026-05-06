"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import { checklist_status_type } from "@/shared/enums";
import { GridColDef } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface ChecklistDataGridProps {
  rows: {
    id: number;
    sketch_title: string;
    status: string;
    video_url: string | null;
    sketch_id: number | null;
    show__title: string;
    season_number: number | undefined;
    episode_number: number | undefined;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function ChecklistDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: ChecklistDataGridProps) {
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", type: "number", width: 80 },
    {
      field: "sketch_title",
      flex: 1,
      headerName: "Sketch Title",
    },
    { field: "show__title", headerName: "Show", type: "string" },
    {
      field: "season_number",
      headerName: "Season",
      type: "number",
    },
    {
      field: "episode_number",
      headerName: "Episode",
      type: "number",
    },
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: Object.values(checklist_status_type),
      width: 120,
    },
    { field: "video_url", headerName: "Video URL", flex: 1 },
    { field: "sketch_id", headerName: "Sketch ID", type: "number", width: 100 },
  ];

  return (
    <BaseDataGrid
      basePath="checklist"
      columns={columns}
      columnVisibilityModel={{
        id: false,
      }}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
