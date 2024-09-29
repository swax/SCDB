import { ListSearchParms } from "@/backend/content/listHelper";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

interface BaseDataGridProps<T> {
  basePath: string;
  columns: GridColDef[];
  columnVisibilityModel?: GridColumnVisibilityModel;
  rows: T[];
  searchParams: ListSearchParms;
  totalRowCount: number;
  toolbar?: React.ReactNode;
}

export default function BaseDataGrid<T>({
  basePath,
  columns,
  columnVisibilityModel,
  rows,
  searchParams,
  totalRowCount,
  toolbar,
}: BaseDataGridProps<T>) {
  // Hooks
  const router = useRouter();

  // Event Handlers
  function dataGrid_paginationModelChange(model: GridPaginationModel) {
    // Grid uses a zero based page number
    if (model.page != searchParams.page - 1) {
      searchParams.page = model.page + 1;
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
      searchParams.sortDir = sort;
    }

    buildAndPushUrl();
  }

  function dataGrid_filterModelChange(filterModel: GridFilterModel) {
    if (!filterModel.items.length) {
      searchParams.filterField = undefined;
      searchParams.filterValue = undefined;
      searchParams.filterOp = undefined;
    } else {
      const { field, value, operator } = filterModel.items[0];

      // if value is a date set it to the just the date component of the iso string
      let cleanVal = undefined;

      if (value === false) {
        cleanVal = "false";
      } else if (!value) {
        cleanVal = undefined;
      } else if (value instanceof Date) {
        cleanVal = value.toISOString().split("T")[0];
      } else {
        cleanVal = `${value}`;
      }

      searchParams.filterField = field;
      searchParams.filterValue = cleanVal;
      searchParams.filterOp = operator;
    }

    buildAndPushUrl();
  }

  // Helpers
  function buildAndPushUrl() {
    const { page, sortField, sortDir, filterField, filterValue, filterOp } =
      searchParams;

    let url = `/${basePath}?page=${page}`;

    if (sortField && sortDir) {
      url += `&sortField=${sortField}&sortDir=${sortDir}`;
    }

    if (filterField && filterValue && filterOp) {
      url += `&filterField=${filterField}&filterValue=${filterValue}&filterOp=${filterOp}`;
    }

    router.push(url);
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        {toolbar}
      </GridToolbarContainer>
    );
  }

  // Rendering
  const {
    page,
    pageSize,
    sortField,
    sortDir,
    filterField,
    filterValue,
    filterOp,
  } = searchParams;

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
    filterField && filterValue && filterOp
      ? {
          filterModel: {
            items: [
              {
                field: filterField,
                value: filterValue,
                operator: filterOp,
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
          paginationModel: { pageSize, page: page - 1 },
        },
        sorting,
        filter,
      }}
      columnVisibilityModel={columnVisibilityModel}
      onFilterModelChange={dataGrid_filterModelChange}
      onPaginationModelChange={dataGrid_paginationModelChange}
      onSortModelChange={dataGrid_sortModelChange}
      paginationMode="server"
      rowCount={totalRowCount}
      rows={rows}
      rowSelection={false}
      slots={{ toolbar: CustomToolbar }}
      sortingMode="server"
      style={{ border: "none" }}
    />
  );
}
