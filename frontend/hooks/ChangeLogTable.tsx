import { ChangelogEntry } from "@/backend/changelogService";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@mui/material";

interface ChangeLogTableProps {
  changelog: ChangelogEntry[];
}

// TODO: Hide username column if log is only for a single user

export default function ChangeLogTable({ changelog }: ChangeLogTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Changed by</TableCell>
          <TableCell>Summary</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {changelog.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
              {entry.changed_at.toLocaleString()}
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
              {entry.changed_by.name}
            </TableCell>
            <TableCell sx={{ verticalAlign: "top" }}>
              <pre style={{ fontSize: 12, margin: 0 }}>{entry.summary}</pre>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
