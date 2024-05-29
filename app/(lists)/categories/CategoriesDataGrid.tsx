"use client";

import MuiNextLink from "@/app/components/MuiNextLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface CategoryDataGridProps {
  rows: {
    id: number;
    name: string;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function CategoryDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: CategoryDataGridProps) {
  // Constants
  type CategoryRow = (typeof rows)[number];

  const columns = [
    {
      field: "name",
      flex: 1,
      headerName: "Category",
      renderCell: ({
        row: category,
      }: GridRenderCellParams<CategoryRow, CategoryRow["name"]>) => {
        return (
          <MuiNextLink
            href={`/cateogy/${category.id}/${category.url_slug}`}
            underline="hover"
          >
            {category.name}
          </MuiNextLink>
        );
      },
    },
  ];

  return (
    <BaseDataGrid
      basePath="categories"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
