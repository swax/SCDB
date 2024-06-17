"use client";

import { ContentLink } from "@/app/components/ContentLink";
import { ListSearchParms } from "@/backend/content/listHelper";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import BaseDataGrid from "../../../(lists)/BaseDataGrid";

interface TagsDataGridProps {
  basePath: string;
  rows: {
    id: number;
    name: string;
    url_slug: string;
  }[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function TagsDataGrid({
  basePath,
  rows,
  searchParams,
  totalRowCount,
}: TagsDataGridProps) {
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
        return <ContentLink mui entry={tag} table="tag" />;
      },
    },
    {
      field: "sketch_tags___count",
      headerName: "Sketches",
      filterable: false,
      type: "number",
    },
  ];

  return (
    <BaseDataGrid
      basePath={basePath}
      columns={columns}
      searchParams={searchParams}
      rows={rows}
      totalRowCount={totalRowCount}
    />
  );
}
