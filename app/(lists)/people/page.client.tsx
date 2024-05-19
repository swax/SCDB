"use client";

import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import SearchGrid from "../SearchGrid";

interface PersonListClientPageProps {
  page: number;
  pageSize: number;
  rows: {
    id: number;
    name: string;
    birthDate: Date | null;
    url_slug: string;
  }[];
  rowCount: number;
}

export default function SketchListClientPage({
  page,
  rows,
  rowCount,
  pageSize,
}: PersonListClientPageProps) {
  // Constants
  type PersonRow = (typeof rows)[number];

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 300,
      renderCell: ({
        row: person,
      }: GridRenderCellParams<PersonRow, PersonRow["name"]>) => {
        return (
          <Link
            href={`/person/${person.id}/${person.url_slug}`}
            underline="hover"
          >
            {person.name}
          </Link>
        );
      },
    },
    { field: "birthDate", headerName: "Age", width: 200 },
  ];

  return (
    <SearchGrid
      basePath="people"
      columns={columns}
      page={page}
      pageSize={pageSize}
      rows={rows}
      rowCount={rowCount}
    />
  );
}
