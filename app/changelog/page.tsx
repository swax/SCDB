import { getChangelog } from "@/backend/changelogService";
import ChangeLogTable from "@/frontend/hooks/ChangeLogTable";

export default async function Changelog({
  searchParams,
}: {
  searchParams: {
    page: string | undefined;
    rowsPerPage: string | undefined;
  };
}) {
  // URL parmam
  const page = parseInt(searchParams.page || "1");
  const rowsPerPage = parseInt(searchParams.rowsPerPage || "10");

  // Server Data
  const changelog = await getChangelog({
    page,
    rowsPerPage,
  });

  // Rendering
  return (
    <>
      <h1>Changelog</h1>
      <ChangeLogTable
        changelog={changelog}
        page={page}
        rowsPerPage={rowsPerPage}
      />
    </>
  );
}
