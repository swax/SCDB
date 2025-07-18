import { getRowsToReview } from "@/backend/mgmt/reviewService";
import { getEditUrl } from "@/shared/urls";
import { buildPageTitle } from "@/shared/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Metadata } from "next";
import MuiNextLink from "../components/MuiNextLink";

export const metadata: Metadata = {
  title: buildPageTitle("Review"),
  description: "Review the latest changes made to the site by users",
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    rowCount?: number;
  }>;
}) {
  // URL parmam
  const resolvedParams = await searchParams;
  const rowCount = resolvedParams.rowCount || 50;

  // Server data
  const rowsToReview = await getRowsToReview(rowCount);

  // Rendering
  return (
    <>
      <h1>Review</h1>
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
          {rowsToReview.map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                <MuiNextLink
                  href={getEditUrl(row.table_name, row.row_id)}
                  prefetch={false}
                >
                  {row.table_name}/{row.row_id}
                </MuiNextLink>
              </TableCell>
              <TableCell>{row.review_status}</TableCell>
              <TableCell>
                <MuiNextLink
                  href={`/profile/${row.modified_by_username}`}
                  prefetch={false}
                >
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
