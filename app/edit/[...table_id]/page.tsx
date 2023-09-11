import {
  getTableEditConfig
} from "@/backend/services/edit";
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

  const editConfig = await getTableEditConfig(table, parseInt(id));

  // Rendering
  return <EditClientPage editConfig={editConfig} />;
}
