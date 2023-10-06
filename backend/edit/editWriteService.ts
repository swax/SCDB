import prisma from "@/database/prisma";
import tableEditConfigs, { TableEditConfig } from "./tableEditConfigs";

export async function writeFieldValues(
  clientConfig: TableEditConfig,
  id: number
) {
  // Verify table is allowed to be edited
  const serverConfig = tableEditConfigs[clientConfig.table];

  if (!serverConfig) {
    throw new Error("Table is not allowed to be edited");
  }

  // Verify columns are allowed to be edited
  const updatedFields = clientConfig.fields.filter((cf) => cf.newValues);

  const notFoundColumns = updatedFields.filter((cf) => {
    const found = serverConfig.fields.some((sf) => sf.column === cf.column);
    return !found;
  });

  if (notFoundColumns.length > 0) {
    throw new Error(
      `Columns ${notFoundColumns.join()} are not allowed to be edited`
    );
  }

  // Make the updates
  const updateParams = {
    where: {
      id,
    },
    data: {},
  };

  updatedFields.forEach((field) => {
    if (field.column) {
      const dynamicData: any = updateParams.data;
      dynamicData[field.column] = field.newValues![0];
    }
  });

  await prisma.sketch.update(updateParams);

  // TODO: Write audit record
}
