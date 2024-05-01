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
import { usePathname, useRouter } from "next/navigation";

interface ChangeLogTableProps {
  changelog: GetChangelogResponse;
  page: number;
  rowsPerPage: number;
  username?: string;
  profilePage?: boolean;
}

export default function ChangeLogTable({
  changelog,
  page,
  rowsPerPage,
  username,
  profilePage,
}: ChangeLogTableProps) {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  // Events
  function handleChangePage(
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    router.push(buildHref(newPage + 1, rowsPerPage, username));
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const newRowsPerPage = parseInt(event.target.value, 10);

    router.push(buildHref(1, newRowsPerPage, username));
  }

  // Helper
  function buildHref(page: number, rowsPerPage: number, username?: string) {
    return (
      pathname +
      `?page=${page}&rowsPerPage=${rowsPerPage}` +
      (username ? `&username=${username}` : "")
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
          <TableCell sx={headCellStyle}>Summary</TableCell>
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
                  href={buildHref(1, rowsPerPage, entry.changed_by.username)}
                >
                  {entry.changed_by.username}
                </Link>
              </TableCell>
            )}
            <TableCell sx={bodyCellStyle}>{entry.table_name}</TableCell>
            <TableCell sx={bodyCellStyle}>{entry.row_id}</TableCell>
            <TableCell sx={bodyCellStyle}>{entry.operation}</TableCell>
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
