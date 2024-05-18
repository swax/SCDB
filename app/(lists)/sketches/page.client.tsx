"use client";

import { Link } from "@mui/material";
import {
  GridRenderCellParams
} from "@mui/x-data-grid";
import SearchGrid from "../SearchGrid";

interface SketchListClientPageProps {
  page: number;
  pageSize: number;
  rows: {
    id: number;
    title: string;
    show: string;
    year: number | undefined;
    url_slug: string;
  }[];
  rowCount: number;
}

export default function SketchListClientPage({
  page,
  rows,
  rowCount,
  pageSize,
}: SketchListClientPageProps) {
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
    <SearchGrid
      basePath="sketches"
      columns={columns}
      page={page}
      pageSize={pageSize}
      rows={rows}
      rowCount={rowCount}
    />
  );
}
