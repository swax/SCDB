import { getChangelog } from "@/backend/mgmt/changelogService";
import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";

export default async function Changelog({
  searchParams,
}: {
  searchParams: {
    op?: string;
    page?: string;
    row?: string;
    rowsPerPage?: string;
    table?: string;
    username?: string;
  };
}) {
  // URL parmam
  const page = parseInt(searchParams.page || "1");
  const rowsPerPage = parseInt(searchParams.rowsPerPage || "10");

  // Server Data
  const changelog = await getChangelog({
    operation: searchParams.op,
    page,
    rowId: searchParams.row,
    rowsPerPage,
    tableName: searchParams.table,
    username: searchParams.username,
  });

  // Rendering
  return (
    <>
      <h1>Changelog</h1>
      <ChangeLogTable
        changelog={changelog}
        operation={searchParams.op}
        page={page}
        rowId={searchParams.row}
        rowsPerPage={rowsPerPage}
        table={searchParams.table}
        username={searchParams.username}
      />
    </>
  );
}
