"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
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

  const columns = [
    {
      field: "title",
      flex: 1,
      headerName: "Show",
      renderCell: ({
        row: show,
      }: GridRenderCellParams<ShowRow, ShowRow["title"]>) => {
        return (
          <Link href={`/show/${show.id}/${show.url_slug}`} underline="hover">
            {show.title}
          </Link>
        );
      },
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
