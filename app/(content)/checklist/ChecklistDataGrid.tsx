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
    notes: string | null;
    sketch_id: number | null;
    show__title: string;
    season__year: number | undefined;
    episode__number: number | undefined;
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
      field: "season__year",
      headerName: "Year",
      type: "number",
      valueFormatter: (value?: number) => value?.toString(),
    },
    {
      field: "episode__number",
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
    { field: "notes", headerName: "Notes", flex: 1 },
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
