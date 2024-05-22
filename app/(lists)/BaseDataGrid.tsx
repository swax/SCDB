import { ListSearchParms } from "@/backend/content/listHelper";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortDirection,
  GridSortModel,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

interface BaseDataGridProps {
  basePath: string;
  columns: GridColDef[];
  rows: any[];
  searchParams: ListSearchParms;
  totalRowCount: number;
}

export default function BaseDataGrid({
  basePath,
  columns,
  rows,
  searchParams,
  totalRowCount,
}: BaseDataGridProps) {
  // Hooks
  const router = useRouter();

  // Event Handlers
  function dataGrid_paginationModelChange(model: GridPaginationModel) {
    if (model.page != searchParams.page) {
      searchParams.page = model.page;
      buildAndPushUrl();
    }
  }

  function dataGrid_sortModelChange(sortModel: GridSortModel) {
    if (!sortModel.length) {
      searchParams.sortField = undefined;
      searchParams.sortDir = undefined;
    } else {
      const { field, sort } = sortModel[0];
      searchParams.sortField = field;
      searchParams.sortDir = sort as any;
    }

    buildAndPushUrl();
  }

  function dataGrid_filterModelChange(filterModel: GridFilterModel) {
    const { field, value } = filterModel.items[0];
    searchParams.filterField = field;
    searchParams.filterValue = value;

    buildAndPushUrl();
  }

  // Helpers
  function buildAndPushUrl() {
    const { page, sortField, sortDir, filterField, filterValue } = searchParams;

    let url = `/${basePath}?page=${page}`;

    if (sortField && sortDir) {
      url += `&sortField=${sortField}&sortDir=${sortDir}`;
    }

    if (filterField && filterValue) {
      url += `&filterField=${filterField}&filterValue=${filterValue}`;
    }

    router.push(url);
  }

  // Rendering
  const { page, pageSize, sortField, sortDir, filterField, filterValue } =
    searchParams;

  const sorting =
    sortField && sortDir
      ? {
          sortModel: [
            {
              field: sortField,
              sort: sortDir,
            },
          ],
        }
      : undefined;

  const filter =
    filterField && filterValue
      ? {
          filterModel: {
            items: [
              {
                field: filterField,
                value: filterValue,
                operator: "contains",
              },
            ],
          },
        }
      : undefined;

  return (
    <DataGrid
      autoPageSize
      columns={columns}
      filterMode="server"
      initialState={{
        pagination: {
          paginationModel: { pageSize, page },
        },
        sorting,
        filter,
      }}
      onFilterModelChange={dataGrid_filterModelChange}
      onPaginationModelChange={dataGrid_paginationModelChange}
      onSortModelChange={dataGrid_sortModelChange}
      paginationMode="server"
      rowCount={totalRowCount}
      rows={rows}
      rowSelection={false}
      sortingMode="server"
      sx={{ border: "none" }}
    />
  );
}
