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
export async function getContent<T extends { url_slug: string }>(
  route: string,
  params: ContentPageParams,
  serviceFunc: (id: number) => Promise<T | null>,
) {
  const [id, slug] = params.idslug;

  const content = await serviceFunc(parseInt(id));

  if (!content) {
    notFound();
  }

  if (slug !== content.url_slug) {
    redirect(`/${route}/${id}/${content.url_slug}`);
  }

  return content;
}
