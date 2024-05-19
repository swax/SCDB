"use client";

import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface PeopleDataGridProps {
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

export default function PeopleDataGrid({
  page,
  rows,
  rowCount,
  pageSize,
}: PeopleDataGridProps) {
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
    <BaseDataGrid
      basePath="people"
      columns={columns}
      page={page}
      pageSize={pageSize}
      rows={rows}
      rowCount={rowCount}
    />
  );
}
