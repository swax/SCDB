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
}

// TODO: Hide username column if log is only for a single user

export default function ChangeLogTable({
  changelog,
  page,
  rowsPerPage,
}: ChangeLogTableProps) {
  // Hooks
  const router = useRouter();
  const pathname = usePathname();

  // Events
  function handleChangePage(
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) {
    router.push(pathname + `?page=${newPage + 1}&rowsPerPage=${rowsPerPage}`);
  }

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const newRowsPerPage = parseInt(event.target.value, 10);

    router.push(pathname + `?page=1&rowsPerPage=${newRowsPerPage}`);
  }

  // Rendering
  const headCellStyle = { whiteSpace: "nowrap" };
  const bodyCellStyle = { whiteSpace: "nowrap", verticalAlign: "top" };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={headCellStyle}>Date</TableCell>
          <TableCell sx={headCellStyle}>Changed by</TableCell>
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
            <TableCell sx={bodyCellStyle}>
              <Link href={`/profile/${entry.changed_by.username}`}>
                {entry.changed_by.username}
              </Link>
            </TableCell>
            <TableCell sx={bodyCellStyle}>{entry.table_name}</TableCell>
            <TableCell sx={bodyCellStyle}>{entry.row_id}</TableCell>
            <TableCell sx={bodyCellStyle}>{entry.operation}</TableCell>
            <TableCell sx={{ verticalAlign: "top" }}>
              <pre style={{ fontSize: 12, margin: 0 }}>{entry.summary}</pre>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
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
    </Table>
  );
}
