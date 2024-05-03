import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import { getTableOrm } from "@/backend/edit/editReadService";
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

  const table = await getTableOrm(tableName, numId, session?.user.role);

  // Rendering
  return <EditClientPage table={table} id={numId} />;
}
