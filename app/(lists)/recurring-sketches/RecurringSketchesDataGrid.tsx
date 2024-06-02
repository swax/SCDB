"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface RecurringSketchesDataGridProps {
  rows: {
    id: number;
    title: string;
    url_slug: string;
    sketches___count: number;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function RecurringSketchesDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: RecurringSketchesDataGridProps) {
  // Constants
  type RecurringSketchRow = (typeof rows)[number];

  const columns: GridColDef[] = [
    {
      field: "title",
      flex: 1,
      headerName: "Recurring Sketch",
      renderCell: ({
        row: recurringSketch,
      }: GridRenderCellParams<
        RecurringSketchRow,
        RecurringSketchRow["title"]
      >) => {
        return (
          <ContentLink mui table="recurring-sketch" entry={recurringSketch} />
        );
      },
    },
    {
      field: "sketches___count",
      headerName: "Sketches",
      filterable: false,
      type: "number",
    },
  ];

  return (
    <BaseDataGrid
      basePath="recurring-sketches"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
