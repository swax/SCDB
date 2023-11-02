import { getTableEditConfig } from "@/backend/edit/editReadService";
import EditClientPage from "./page.client";

interface EditTablePageProps {
  params: {
    table_id: string[];
  };
}

export default async function EditTablePage({ params }: EditTablePageProps) {
  console.log(params);
  // Server Data
  const [table, id] = params.table_id;

  const numId = parseInt(id);

  const editConfig = await getTableEditConfig(table, numId);

  // Rendering
  return <EditClientPage editConfig={editConfig} id={numId} />;
}
