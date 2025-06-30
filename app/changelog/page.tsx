import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import { getChangelog } from "@/backend/mgmt/changelogService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: buildPageTitle("Changelog"),
  description: "View the latest changes made to the site",
};

export default async function Changelog({
  searchParams,
}: {
  searchParams: Promise<{
    op?: string;
    page?: string;
    row?: string;
    rowsPerPage?: string;
    table?: string;
    username?: string;
  }>;
}) {
  // URL params
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1");
  const rowsPerPage = parseInt(resolvedParams.rowsPerPage || "10");

  // Server Data
  const changelog = await getChangelog({
    operation: resolvedParams.op,
    page,
    rowId: resolvedParams.row,
    rowsPerPage,
    tableName: resolvedParams.table,
    username: resolvedParams.username,
  });

  // Rendering
  return (
    <>
      <h1>Changelog</h1>
      <ChangeLogTable
        changelog={changelog}
        operation={resolvedParams.op}
        page={page}
        rowId={resolvedParams.row}
        rowsPerPage={rowsPerPage}
        table={resolvedParams.table}
        username={resolvedParams.username}
      />
    </>
  );
}
