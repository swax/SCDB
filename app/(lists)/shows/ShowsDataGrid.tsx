"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface ShowDataGridProps {
  rows: {
    id: number;
    title: string;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function ShowDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: ShowDataGridProps) {
  // Constants
  type ShowRow = (typeof rows)[number];

  const columns: GridColDef[] = [
    {
      field: "title",
      flex: 1,
      headerName: "Show",
      renderCell: ({
        row: show,
      }: GridRenderCellParams<ShowRow, ShowRow["title"]>) => {
        return <ContentLink mui entry={show} table="show" />;
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
      basePath="shows"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
