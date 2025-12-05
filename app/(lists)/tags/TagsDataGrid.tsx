"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../BaseDataGrid";

interface TagDataGridProps {
  rows: {
    id: number;
    name: string;
    url_slug: string;
    category__name: string;
    category__url_slug: string;
    category__id: number;
    sketch_tags___count: number;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function TagsDataGrid({
  rows,
  searchParams,
  totalRowCount,
}: TagDataGridProps) {
  // Constants
  type TagRow = (typeof rows)[number];

  const columns: GridColDef[] = [
    {
      field: "name",
      flex: 1,
      headerName: "Tag",
      renderCell: ({
        row: tag,
      }: GridRenderCellParams<TagRow, TagRow["name"]>) => {
        return <ContentLink mui table="tag" entry={tag} />;
      },
    },
    {
      field: "category__name",
      flex: 1,
      headerName: "Category",
      renderCell: ({
        row: tag,
      }: GridRenderCellParams<TagRow, TagRow["category__name"]>) => {
        return (
          <ContentLink
            mui
            table="category"
            entry={{
              id: tag.category__id,
              name: tag.category__name,
              url_slug: tag.category__url_slug,
            }}
          />
        );
      },
    },
    {
      field: "sketch_tags___count",
      headerName: "Sketches",
      type: "number",
      filterable: false,
    },
  ];

  return (
    <BaseDataGrid
      basePath="tags"
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
