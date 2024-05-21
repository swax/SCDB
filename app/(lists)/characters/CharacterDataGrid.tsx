"use client";

import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface CharacterDataGridProps {
  page: number;
  pageSize: number;
  rows: {
    id: number;
    name: string;
    url_slug: string;
  }[];
  rowCount: number;
}

export default function CharacterDataGrid({
  page,
  rows,
  rowCount,
  pageSize,
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
      page={page}
      pageSize={pageSize}
      rows={rows}
      rowCount={rowCount}
    />
  );
}
