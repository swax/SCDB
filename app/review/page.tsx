import { getRowsToReview } from "@/backend/mgmt/reviewService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import MuiNextLink from "../components/MuiNextLink";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: {
    rowCount?: number;
  };
}) {
  // URL parmam
  const rowCount = searchParams.rowCount || 50;

  // Server data
  const rowsToReview = await getRowsToReview(rowCount);

  // Rendering
  return (
    <>
      <h1>Review </h1>
      <h5>
        Only mods can review. Mods cannot review their own changes.
        Flagged/oldest rows that need review are shown first.
      </h5>
      {rowsToReview.length === 0 && <h5>No rows to review.</h5>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Table/Row</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Modified By</TableCell>
            <TableCell>Modified At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsToReview.map((row) => (
            <TableRow key={row.row_id}>
              <TableCell>
                <MuiNextLink href={`/edit/${row.table_name}/${row.row_id}`}>
                  {row.table_name}/{row.row_id}
                </MuiNextLink>
              </TableCell>
              <TableCell>{row.review_status}</TableCell>
              <TableCell>
                <MuiNextLink href={`/profile/${row.modified_by_username}`}>
                  {row.modified_by_username}
                </MuiNextLink>
              </TableCell>
              <TableCell>{row.modified_at.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rowsToReview.length == rowCount && (
        <h5>
          Showing first {rowCount} rows that need review. To view more set the
          rowCount query parameter.
        </h5>
      )}
    </>
  );
}
