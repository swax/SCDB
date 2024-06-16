import { notFound } from "next/navigation";
import getContentFuncs from "../getContentFuncs";

interface TabelIdParams {
  params: {
    table_id: string[];
  };
}

/**
 * This will get and cache the content.
 * Updated content won't be returned without the path being revalidated.
 */
export async function GET(req: Request, { params }: TabelIdParams) {
  const [table, id] = params.table_id;

  if (!id) {
    new Error("Invalid id");
  }

  const idNum = parseInt(id);

  if (!(table in getContentFuncs)) {
    notFound();
  }

  // Test if table is a key of getContentFuncs
  if (!isKeyOfGetContentFuncs(table)) {
    notFound();
  }

  const getContentAsync = getContentFuncs[table];
  const content = await getContentAsync(idNum);
  return Response.json(content);
}

function isKeyOfGetContentFuncs(
  key: string,
): key is keyof typeof getContentFuncs {
  return key in getContentFuncs;
}
