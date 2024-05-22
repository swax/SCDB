"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import { Link } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface PeopleDataGridProps {
  rows: {
    id: number;
    name: string;
    age: number | null;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function PeopleDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: PeopleDataGridProps) {
  // Constants
  type PersonRow = (typeof rows)[number];

  const columns = [
    {
      field: "name",
      headerName: "Person",
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
    { field: "age", headerName: "Age", width: 200 },
  ];

  return (
    <BaseDataGrid
      basePath="people"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
