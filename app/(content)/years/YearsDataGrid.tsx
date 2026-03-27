"use client";

import MuiNextLink from "@/app/components/MuiNextLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface YearsDataGridProps {
  rows: {
    id: number;
    year: number;
    sketchCount: number;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function YearsDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: YearsDataGridProps) {
  type YearRow = (typeof rows)[number];

  const columns: GridColDef[] = [
    {
      field: "year",
      headerName: "Year",
      type: "string",
      flex: 1,
      renderCell: (params: GridRenderCellParams<YearRow, YearRow["year"]>) => (
        <MuiNextLink href={`/years/${params.value}`} underline="hover">
          {params.value}
        </MuiNextLink>
      ),
      valueFormatter: (value: number) => value.toString(),
    },
    {
      field: "sketchCount",
      headerName: "Sketches",
      type: "number",
    },
  ];

  return (
    <BaseDataGrid
      basePath="years"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
