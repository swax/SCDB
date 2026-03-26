import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import { getTableCms } from "@/backend/edit/editReadService";
import { getChangelog } from "@/backend/mgmt/changelogService";
import { getPrismaModel } from "@/database/prisma";
import { getSingularTableName } from "@/shared/tableNames";
import { Box } from "@mui/material";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import EditClientPage from "./page.client";

interface EditTablePageProps {
  params: Promise<{
    table_id: string[];
  }>;
}

async function resolveId(tableName: string, idOrSlug: string) {
  const numId = parseInt(idOrSlug);
  if (!isNaN(numId)) {
    return numId;
  }

  // Resolve slug to numeric ID
  const dbTable = (getSingularTableName(tableName) ?? tableName).replace(
    "-",
    "_",
  );
  const row = await getPrismaModel(dbTable).findFirst({
    where: { url_slug: idOrSlug },
    select: { id: true },
  });

  if (!row) {
    notFound();
  }

  return (row as { id: number }).id;
}

export default async function EditTablePage({ params }: EditTablePageProps) {
  // Server Data
  const resolvedParams = await params;
  const [tableName, idOrSlug] = resolvedParams.table_id;

  const numId = idOrSlug ? await resolveId(tableName, idOrSlug) : NaN;

  const session = await getServerSession(authOptions);

  const table = await getTableCms(tableName, numId, session?.user.role);

  // TODO: Get changes since last reviewed
  const changelog = idOrSlug
    ? await getChangelog({
        page: 1,
        rowsPerPage: 5,
        tableName,
        rowId: String(numId),
      })
    : null;

  // Rendering
  return (
    <>
      <EditClientPage table={table} id={numId} />
      {changelog && Boolean(changelog.entries.length) && (
        <>
          <h4>Recent Changes:</h4>
          <Box style={{ overflowX: "auto" }}>
            <ChangeLogTable
              changelog={changelog}
              page={1}
              rowsPerPage={25}
              table={tableName}
              rowId={String(numId)}
            />
          </Box>
        </>
      )}
    </>
  );
}
