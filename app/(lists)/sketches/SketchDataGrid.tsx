"use client";

import MuiNextLink from "@/app/components/MuiNextLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface SketchDataGridProps {
  rows: {
    id: number;
    title: string;
    show__title: string;
    season__year: number | undefined;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function SketchDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: SketchDataGridProps) {
  // Constants
  type SketchRow = (typeof rows)[number];

  const columns: GridColDef[] = [
    {
      field: "title",
      flex: 1,
      headerName: "Sketch",
      renderCell: (
        params: GridRenderCellParams<SketchRow, SketchRow["title"]>,
      ) => {
        const sketch = params.row;
        return (
          <MuiNextLink
            href={`/sketch/${sketch.id}/${sketch.url_slug}`}
            underline="hover"
          >
            {sketch.title}
          </MuiNextLink>
        );
      },
    },
    { field: "show__title", flex: 1, headerName: "Show", type: "string" },
    {
      field: "season__year",
      flex: 1,
      headerName: "Year",
      type: "number",
      valueFormatter: (value?: number) => value?.toString(),
    },
  ];

  return (
    <BaseDataGrid
      basePath="sketches"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
