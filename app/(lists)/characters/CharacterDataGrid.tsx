"use client";

import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";
import { ListSearchParms } from "@/backend/content/listHelper";

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
      headerName: "Character",
      width: 300,
      renderCell: ({
        row: character,
      }: GridRenderCellParams<CharacterRow, CharacterRow["name"]>) => {
        return (
          <Link
            href={`/character/${character.id}/${character.url_slug}`}
            underline="hover"
          >
            {character.name}
          </Link>
        );
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
