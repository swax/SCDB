"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface CharacterDataGridProps {
  rows: {
    id: number;
    name: string;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function CharacterDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: CharacterDataGridProps) {
  // Constants
  type CharacterRow = (typeof rows)[number];

  const columns = [
    {
      field: "name",
      flex: 1,
      headerName: "Character",
      renderCell: ({
        row: character,
      }: GridRenderCellParams<CharacterRow, CharacterRow["name"]>) => {
        return <ContentLink mui entry={character} table="character" />;
      },
    },
  ];

  return (
    <BaseDataGrid
      basePath="characters"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
