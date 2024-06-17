import { Box, Typography } from "@mui/material";
import { revalidatePath, revalidateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import "server-only";

interface ContentPageParams {
  idslug: string[];
}

export interface ContentPageProps {
  params: ContentPageParams;
}

/**
 * Generic function to get the id/slug from the query params and pull the data from the backend service
 * Re-routing if the slug doesn't match the one from the backend
 */
export async function tryGetContent<T extends { url_slug: string }>(
  table: string,
  params: ContentPageParams,
  serviceFunc: (id: number) => Promise<T | null>,
) {
  const [id, slug] = params.idslug;

  const idNum = parseInt(id);

  const content = await serviceFunc(idNum);

  if (!content) {
    notFound();
  }

  if (slug !== content.url_slug) {
    redirect(`/${table}/${id}/${content.url_slug}`);
  }

  return content;
}

export function revalidateContent(table: string, id: number, slug: string) {
  // For some reason table/id seems to work in prod, but table, id, slug is required for local release run
  // Ideally we want just table/id in case the slug changes
  // According the docs revalidate only supports the full path, not partial paths
  revalidatePath(`/${table}/${id}`);

  if (slug) {
    revalidatePath(`/${table}/${id}/${slug}`);
  }

  // Revalidate the associated list page for the content, default is 5 minutes as well
  revalidateTag(`${table}-list`);
}

/**
 * Deprecated for the more direct, simple and type safe version above
 * Usage:
 *   type SketchType = PromiseReturnType<typeof getContentFuncs.sketch>;
 *   const sketch = await fetchContent<SketchType>("sketch", params);
 */
export async function fetchCachedContent<T extends { url_slug: string } | null>(
  route: string,
  params: ContentPageParams,
) {
  const [id, slug] = params.idslug;

  const res = await fetch(
    process.env["NEXTAUTH_URL"] + `/api/content/${route}/${id}`,
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  const content = (await res.json()) as T;

  if (!content) {
    notFound();
  }

  if (slug !== content.url_slug) {
    redirect(`/${route}/${id}/${content.url_slug}`);
  }
}

export function DateGeneratedFooter({ dataDate }: { dataDate?: Date }) {
  return (
    <Box mt={4}>
      <Typography
        variant="caption"
        sx={{ fontStyle: "italic", color: "DimGrey" }}
      >
        {dataDate
          ? `Data Generated: ${new Date(dataDate).toLocaleString()}`
          : `Page Generated: ${new Date().toLocaleString()}`}
      </Typography>
    </Box>
  );
}
