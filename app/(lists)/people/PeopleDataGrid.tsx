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
      flex: 2,
      headerName: "Person",
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
      flex: 0.5,
      headerName: "Age",
      filterable: false,
      sortable: false,
    },
    {
      field: "birth_date",
      flex: 1,
      headerName: "Birth",
      type: "date",
    },
    {
      field: "death_date",
      flex: 1,
      headerName: "Death",
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
