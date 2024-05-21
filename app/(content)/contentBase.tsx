import { Box, Typography } from "@mui/material";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { notFound, redirect } from "next/navigation";

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
export async function getCachedContent<T extends { url_slug: string }>(
  table: string,
  params: ContentPageParams,
  serviceFunc: (id: number) => Promise<T | null>,
) {
  const [id, slug] = params.idslug;

  const idNum = parseInt(id);

  const getCachedContent = unstable_cache(
    async () => serviceFunc(idNum),
    [table, id],
    {
      tags: [getContentTag(table, idNum)],
    },
  );

  const content = await getCachedContent();

  if (!content) {
    notFound();
  }

  if (slug !== content.url_slug) {
    redirect(`/${table}/${id}/${content.url_slug}`);
  }

  return content;
}

export function getContentTag(table: string, id: number) {
  return `content:${table}:${id}`;
}

export function revalidateContent(table: string, id: number) {
  revalidatePath(`/${table}/${id}`); // Invalidates page cache
  revalidateTag(getContentTag(table, id)); // Invalidates data cache
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

  return content;
}

export function DateGeneratedFooter(params: { dateGenerated: Date }) {
  return (
    <Box mt={4}>
      <Typography
        variant="caption"
        sx={{ fontStyle: "italic", color: "DimGrey" }}
      >
        Data Fetched: {new Date(params.dateGenerated).toLocaleString()}
        <br />
        Page Generated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
}
