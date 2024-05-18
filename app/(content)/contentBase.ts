import { notFound, redirect } from "next/navigation";

interface ContentPageParams {
  idslug: string[];
}

export interface ContentPageProps {
  params: ContentPageParams;
}

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
