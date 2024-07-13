import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import ChangeLogTable from "@/app/changelog/components/ChangeLogTable";
import { getTableCms } from "@/backend/edit/editReadService";
import { getChangelog } from "@/backend/mgmt/changelogService";
import { Box } from "@mui/material";
import { getServerSession } from "next-auth";
import EditClientPage from "./page.client";

interface EditTablePageProps {
  params: {
    table_id: string[];
  };
}

export default async function EditTablePage({ params }: EditTablePageProps) {
  // Server Data
  const [tableName, id] = params.table_id;

  const numId = parseInt(id);

  const session = await getServerSession(authOptions);

  const table = await getTableCms(tableName, numId, session?.user.role);

  // TODO: Get changes since last reviewed
  const changelog = id
    ? await getChangelog({
        page: 1,
        rowsPerPage: 5,
        tableName,
        rowId: id,
      })
    : null;

  // Rendering
  return (
    <>
      <EditClientPage table={table} id={numId} />
      {changelog && Boolean(changelog.entries.length) && (
        <>
          <h4>Recent Changes:</h4>
          <Box sx={{ overflowX: "auto" }}>
            <ChangeLogTable
              changelog={changelog}
              page={1}
              rowsPerPage={25}
              table={tableName}
              rowId={id}
            />
          </Box>
        </>
      )}
    </>
  );
}
