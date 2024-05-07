"use client";

import { GetChangelogResponse } from "@/backend/changelogService";
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface ChangeLogTableProps {
  changelog: GetChangelogResponse;
  operation?: string;
  page: number;
  rowId?: string;
  rowsPerPage: number;
  profilePage?: boolean;
  table?: string;
  username?: string;
}

export default function ChangeLogTable({
  changelog,
  operation,
  page,
  profilePage,
  rowId,
  rowsPerPage,
  table,
  username,
}: ChangeLogTableProps) {
  // Hooks
  const router = useRouter();

  // Events
  function handleChangePage(
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    router.push(
      buildHref(newPage + 1, rowsPerPage, username, table, rowId, operation),
    );
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const newRowsPerPage = parseInt(event.target.value, 10);

    router.push(
      buildHref(1, newRowsPerPage, username, table, rowId, operation),
    );
  }

  // Helper
  function buildHref(
    _page: number,
    _rowsPerPage: number,
    _username?: string,
    _table?: string,
    _rowId?: string,
    _operation?: string,
  ) {
    return (
      `/changelog?page=${_page}&rowsPerPage=${_rowsPerPage}` +
      (_username ? `&username=${_username}` : "") +
      (_table ? `&table=${_table}` : "") +
      (_rowId ? `&row=${_rowId}` : "") +
      (_operation ? `&op=${_operation}` : "")
    );
  }

  // Rendering
  const headCellStyle = { whiteSpace: "nowrap" };
  const bodyCellStyle = { whiteSpace: "nowrap", verticalAlign: "top" };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={headCellStyle}>Date</TableCell>
          {!profilePage && <TableCell sx={headCellStyle}>Changed by</TableCell>}
          <TableCell sx={headCellStyle}>Table</TableCell>
          <TableCell sx={headCellStyle}>Row ID</TableCell>
          <TableCell sx={headCellStyle}>Operation</TableCell>
          <TableCell sx={headCellStyle}>Fields</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {changelog.entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell sx={bodyCellStyle}>
              {entry.changed_at.toLocaleString()}
            </TableCell>
            {!profilePage && (
              <TableCell sx={bodyCellStyle}>
                <Link
                  href={buildHref(
                    1,
                    rowsPerPage,
                    entry.changed_by.username,
                    table,
                    rowId,
                  )}
                >
                  {entry.changed_by.username}
                </Link>
              </TableCell>
            )}
            <TableCell sx={bodyCellStyle}>
              <Link
                href={buildHref(
                  1,
                  rowsPerPage,
                  username,
                  entry.table_name,
                  undefined,
                )}
              >
                {entry.table_name}
              </Link>
            </TableCell>
            <TableCell sx={bodyCellStyle}>
              <Link
                href={buildHref(
                  1,
                  rowsPerPage,
                  username,
                  entry.table_name,
                  entry.row_id,
                )}
              >
                {entry.row_id}
              </Link>
            </TableCell>
            <TableCell sx={bodyCellStyle}>
              <Link
                href={buildHref(
                  1,
                  rowsPerPage,
                  username,
                  entry.table_name,
                  undefined,
                  entry.operation,
                )}
              >
                {entry.operation}
              </Link>
            </TableCell>
            <TableCell sx={{ verticalAlign: "top" }}>
              <pre style={{ fontSize: 12, margin: 0 }}>{entry.summary}</pre>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {!profilePage && (
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              colSpan={10}
              count={changelog.total}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              slotProps={{
                select: {
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
