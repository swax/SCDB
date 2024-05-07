import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getTableOrm } from "@/backend/edit/editReadService";
import { getServerSession } from "next-auth";
import EditClientPage from "./page.client";
import { getChangelog } from "@/backend/changelogService";
import ChangeLogTable from "@/frontend/hooks/ChangeLogTable";

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

  const table = await getTableOrm(tableName, numId, session?.user.role);

  // TODO: Get changes since last reviewed
  const changelog = await getChangelog({
    page: 1,
    rowsPerPage: 5,
    tableName,
    rowId: id,
  });

  // Rendering
  return (
    <>
      <EditClientPage table={table} id={numId} />
      {Boolean(changelog.entries.length) && (
        <>
          <h4>Recent Changes:</h4>
          <ChangeLogTable
            changelog={changelog}
            page={1}
            rowsPerPage={25}
            table={tableName}
            rowId={id}
          />
        </>
      )}
    </>
  );
}
