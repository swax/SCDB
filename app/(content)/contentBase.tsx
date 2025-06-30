import { revalidatePath, revalidateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import "server-only";

export interface ContentPageParams {
  idslug: string[];
}

export interface ContentPageProps {
  params: Promise<ContentPageParams>;
}

/**
 * Generic function to get the id/slug from the query params and pull the data from the backend service
 * Re-routing if the slug doesn't match the one from the backend
 */
export async function tryGetContent<T extends { url_slug: string }>(
  table: string,
  params: Promise<ContentPageParams>,
  serviceFunc: (id: number) => Promise<T | null>,
) {
  const resolvedParams = await params;
  const [id, slug] = resolvedParams.idslug;

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

export function revalidateContent(table: string, id: number, slug?: string) {
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
