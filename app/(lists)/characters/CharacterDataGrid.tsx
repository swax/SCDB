"use client";

import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";
import { ListSearchParms } from "@/backend/content/listHelper";
import MuiNextLink from "@/app/components/MuiNextLink";

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
        return (
          <MuiNextLink
            href={`/character/${character.id}/${character.url_slug}`}
            underline="hover"
          >
            {character.name}
          </MuiNextLink>
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
