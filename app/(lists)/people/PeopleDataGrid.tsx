"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import { Link } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
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

  const columns: GridColDef[] = [
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
    {
      field: "age",
      headerName: "Age",
      width: 100,
      filterable: false,
      sortable: false,
    },
    {
      field: "birth_date",
      headerName: "Birth",
      width: 150,
      type: "date",
    },
    {
      field: "death_date",
      headerName: "Death",
      width: 150,
      type: "date",
    },
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
