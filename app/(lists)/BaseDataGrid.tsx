"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  Pagination,
  PaginationItem,
  TextField,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  Toolbar,
  ToolbarPropsOverrides,
} from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    searchValue: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    extraToolbar?: React.ReactNode;
  }
}

function CustomToolbar({
  searchValue,
  onSearchChange,
  inputRef,
  extraToolbar,
}: ToolbarPropsOverrides) {
  return (
    <Toolbar>
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchValue}
          onChange={onSearchChange}
          inputRef={inputRef}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 200,
          }}
        />
        {extraToolbar}
      </Box>
    </Toolbar>
  );
}

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
  const [searchValue, setSearchValue] = useState(searchParams.search || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shouldFocusRef = useRef(false);

  // Restore focus after re-render if we were typing
  useEffect(() => {
    if (shouldFocusRef.current && inputRef.current) {
      inputRef.current.focus();
      shouldFocusRef.current = false;
    }
  });

  // Helpers
  function buildUrl(overrides: Partial<ListSearchParms> = {}) {
    const merged = { ...searchParams, ...overrides };
    const {
      page,
      search,
      sortField,
      sortDir,
      filterField,
      filterValue,
      filterOp,
      hiddenColumns,
    } = merged;

    let url = `/${basePath}?page=${page}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (sortField && sortDir) {
      url += `&sortField=${sortField}&sortDir=${sortDir}`;
    }

    if (filterField && filterValue && filterOp) {
      url += `&filterField=${filterField}&filterValue=${filterValue}&filterOp=${filterOp}`;
    }

    if (hiddenColumns) {
      url += `&hiddenColumns=${encodeURIComponent(hiddenColumns)}`;
    }

    return url;
  }

  function navigateTo(overrides: Partial<ListSearchParms>) {
    router.push(buildUrl(overrides), { scroll: false });
  }

  // Event Handlers
  function dataGrid_paginationModelChange(model: GridPaginationModel) {
    // Grid uses a zero based page number
    if (model.page != searchParams.page - 1) {
      navigateTo({ page: model.page + 1 });
    }
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSearchValue(value);

    // Mark that we should restore focus after re-render
    shouldFocusRef.current = true;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      shouldFocusRef.current = true; // Keep focus after URL update
      navigateTo({ search: value || undefined, page: 1 });
    }, 500);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  function dataGrid_sortModelChange(sortModel: GridSortModel) {
    if (!sortModel.length) {
      navigateTo({ sortField: undefined, sortDir: undefined });
    } else {
      const { field, sort } = sortModel[0];
      navigateTo({ sortField: field, sortDir: sort });
    }
  }

  function dataGrid_filterModelChange(filterModel: GridFilterModel) {
    if (!filterModel.items.length) {
      navigateTo({
        filterField: undefined,
        filterValue: undefined,
        filterOp: undefined,
      });
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

      navigateTo({
        filterField: field,
        filterValue: cleanVal,
        filterOp: operator,
      });
    }
  }

  function dataGrid_columnVisibilityModelChange(
    model: GridColumnVisibilityModel,
  ) {
    // Get list of hidden columns (where value is false)
    const hiddenCols = Object.entries(model)
      .filter(([, visible]) => !visible)
      .map(([field]) => field);

    navigateTo({
      hiddenColumns: hiddenCols.length ? hiddenCols.join(",") : undefined,
    });
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
    hiddenColumns,
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

  // Merge default column visibility with URL-based visibility
  const mergedColumnVisibilityModel: GridColumnVisibilityModel = {
    ...columnVisibilityModel,
  };

  // Parse hidden columns from URL and apply them
  if (hiddenColumns) {
    const hiddenColArray = hiddenColumns.split(",");
    hiddenColArray.forEach((col) => {
      mergedColumnVisibilityModel[col] = false;
    });

    // Also set any columns not in the hidden list to true (they're visible)
    columns.forEach((col) => {
      if (col.field && !hiddenColArray.includes(col.field)) {
        mergedColumnVisibilityModel[col.field] = true;
      }
    });
  }

  const totalPages = Math.ceil(totalRowCount / pageSize);

  return (
    <>
      <DataGrid
        columns={columns}
        filterMode="server"
        initialState={{
          pagination: {
            paginationModel: { pageSize, page: page - 1 },
          },
          sorting,
          filter,
          columns: {
            columnVisibilityModel: mergedColumnVisibilityModel,
          },
        }}
        onColumnVisibilityModelChange={dataGrid_columnVisibilityModelChange}
        onFilterModelChange={dataGrid_filterModelChange}
        onPaginationModelChange={dataGrid_paginationModelChange}
        onSortModelChange={dataGrid_sortModelChange}
        paginationMode="server"
        rowCount={totalRowCount}
        rows={rows}
        rowSelection={false}
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          toolbar: {
            searchValue,
            onSearchChange: handleSearchChange,
            inputRef,
            extraToolbar: toolbar,
          },
        }}
        showToolbar
        sortingMode="server"
        style={{ border: "none" }}
        hideFooterPagination
      />
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, newPage) => {
              event.preventDefault();
              navigateTo({ page: newPage });
            }}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                href={buildUrl({ page: item.page || 1 })}
                {...item}
              />
            )}
          />
        </Box>
      )}
    </>
  );
}
