"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";
import { Chip } from "@mui/material";

interface SketchDataGridProps {
  rows: {
    id: number;
    title: string;
    show__title: string;
    season__year: number | undefined;
    url_slug: string;
    site_rating: number | null;
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
        return <ContentLink mui entry={sketch} table="sketch" />;
      },
    },
    { field: "site_rating", flex: 1, headerName: "Rating", type: "number" },
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
      toolbar={
        <Chip
          clickable
          component="a"
          href="/recurring-sketches"
          label="Recurring Sketches"
          size="small"
          sx={{ ml: 2 }}
          variant="outlined"
        />
      }
    />
  );
}
