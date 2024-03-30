import { getTableOrm } from "@/backend/edit/editReadService";
import EditClientPage from "./page.client";

interface EditTablePageProps {
  params: {
    table_id: string[];
  };
}

export default async function EditTablePage({ params }: EditTablePageProps) {
  console.log(params);
  // Server Data
  const [tableName, id] = params.table_id;

  const numId = parseInt(id);

  const table = await getTableOrm(tableName, numId);

  // Rendering
  return <EditClientPage table={table} id={numId} />;
}
