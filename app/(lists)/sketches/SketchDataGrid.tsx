"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";
import { Button } from "@mui/material";

interface SketchDataGridProps {
  rows: {
    id: number;
    title: string;
    show__title: string;
    season__year: number | undefined;
    url_slug: string;
    site_rating: number | null;
    review_status: string;
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
    { field: "id", headerName: "ID", type: "number", width: 80 },
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
    { field: "site_rating", headerName: "Rating", type: "number" },
    { field: "show__title", headerName: "Show", type: "string" },
    {
      field: "season__year",
      headerName: "Year",
      type: "number",
      valueFormatter: (value?: number) => value?.toString(),
    },
    {
      field: "review_status",
      headerName: "Review Status",
      type: "string",
      width: 150,
    },
    {
      field: "posted_on_socials",
      headerName: "Posted",
      type: "boolean",
    },
  ];

  return (
    <BaseDataGrid
      basePath="sketches"
      columns={columns}
      columnVisibilityModel={{
        id: false,
        review_status: false,
        posted_on_socials: false,
      }}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
      toolbar={
        <Button
          component="a"
          href="/recurring-sketches"
          size="small"
          style={{ marginLeft: 16 }}
        >
          List Recurring Sketches
        </Button>
      }
    />
  );
}
