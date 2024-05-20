import { unstable_cache } from "next/cache";
import { notFound, redirect } from "next/navigation";

interface ContentPageParams {
  idslug: string[];
}

export interface ContentPageProps {
  params: ContentPageParams;
}

/**
 * Deprecated as only fetch() is cacheable
 * Generic function to get the id/slug from the query params and pull the data from the backend service
 * Re-routing if the slug doesn't match the one from the backend
 */
export async function getCachedContent<T extends { url_slug: string }>(
  route: string,
  params: ContentPageParams,
  serviceFunc: (id: number) => Promise<T | null>,
) {
  const [id, slug] = params.idslug;

  const getCachedContent = unstable_cache(
    async () => serviceFunc(parseInt(id)),
    [route, id],
  );

  const content = await getCachedContent();

  if (!content) {
    notFound();
  }

  if (slug !== content.url_slug) {
    redirect(`/${route}/${id}/${content.url_slug}`);
  }

  return content;
}

export async function fetchCachedContent<T extends { url_slug: string } | null>(
  route: string,
  params: ContentPageParams,
) {
  const [id, slug] = params.idslug;

  const res = await fetch(
    process.env["NEXTAUTH_URL"] + `/api/content/${route}/${id}`,
  );

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

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
