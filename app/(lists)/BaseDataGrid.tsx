"use client";

import { ListSearchParms } from "@/backend/content/listHelper";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, TextField } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  Toolbar,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [searchValue, setSearchValue] = useState(
    (searchParams as { search?: string }).search || "",
  );
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

  // Event Handlers
  function dataGrid_paginationModelChange(model: GridPaginationModel) {
    // Grid uses a zero based page number
    if (model.page != searchParams.page - 1) {
      searchParams.page = model.page + 1;
      buildAndPushUrl();
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
      (searchParams as { search?: string }).search = value || undefined;
      searchParams.page = 1; // Reset to first page on search
      shouldFocusRef.current = true; // Keep focus after URL update
      buildAndPushUrl();
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
    const search = (searchParams as { search?: string }).search;

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

    router.push(url, { scroll: false });
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

  function CustomToolbar() {
    return (
      <Toolbar>
        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
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
          {toolbar}
        </Box>
      </Toolbar>
    );
  }

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
        columns: {
          columnVisibilityModel,
        },
      }}
      onFilterModelChange={dataGrid_filterModelChange}
      onPaginationModelChange={dataGrid_paginationModelChange}
      onSortModelChange={dataGrid_sortModelChange}
      paginationMode="server"
      rowCount={totalRowCount}
      rows={rows}
      rowSelection={false}
      slots={{ toolbar: CustomToolbar }}
      showToolbar
      sortingMode="server"
      style={{ border: "none" }}
    />
  );
}
