"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";
import { Button } from "@mui/material";

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

  const columns: GridColDef[] = [
    {
      field: "name",
      flex: 1,
      headerName: "Category",
      renderCell: ({
        row: category,
      }: GridRenderCellParams<CategoryRow, CategoryRow["name"]>) => {
        return <ContentLink mui table="category" entry={category} />;
      },
    },
    {
      field: "tags___count",
      headerName: "Tags",
      type: "number",
      filterable: false,
    },
  ];

  return (
    <BaseDataGrid
      basePath="categories"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
      toolbar={
        <Button
          component="a"
          href="/tags"
          size="small"
          style={{ marginLeft: 16 }}
        >
          List All Tags
        </Button>
      }
    />
  );
}
