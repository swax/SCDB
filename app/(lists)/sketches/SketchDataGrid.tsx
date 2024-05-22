"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface SketchDataGridProps {
  rows: {
    id: number;
    title: string;
    show: string;
    year: number | undefined;
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

  const columns = [
    {
      field: "title",
      headerName: "Sketch",
      width: 300,
      renderCell: (
        params: GridRenderCellParams<SketchRow, SketchRow["title"]>,
      ) => {
        const sketch = params.row;
        return (
          <Link
            href={`/sketch/${sketch.id}/${sketch.url_slug}`}
            underline="hover"
          >
            {sketch.title}
          </Link>
        );
      },
    },
    { field: "show", headerName: "Show", width: 200 },
    { field: "year", headerName: "Year", width: 100 },
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
