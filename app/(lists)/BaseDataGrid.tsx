import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

interface BaseDataGridProps {
  basePath: string;
  columns: GridColDef[];
  page: number;
  pageSize: number;
  rows: any[];
  rowCount: number;
}

export default function BaseDataGrid({
  basePath,
  columns,
  page,
  pageSize,
  rows,
  rowCount,
}: BaseDataGridProps) {
  // Hooks
  const router = useRouter();

  // Event Handlers
  function dataGrid_paginationModelChange(model: GridPaginationModel) {
    if (model.page != page) {
      router.push(`/${basePath}?page=${model.page + 1}`);
    }
  }

  // Rendering
  return (
    <DataGrid
      autoPageSize
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { pageSize, page },
        },
      }}
      onPaginationModelChange={dataGrid_paginationModelChange}
      paginationMode="server"
      rowCount={rowCount}
      rows={rows}
      rowSelection={false}
      sx={{ border: "none" }}
    />
  );
}
