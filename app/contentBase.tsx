import { getPrismaModel } from "@/database/prisma";
import { getContentPath, getPluralTableName } from "@/shared/tableNames";
import { revalidatePath, revalidateTag } from "next/cache";
import { notFound, permanentRedirect } from "next/navigation";
import "server-only";

export interface ContentPageParams {
  idslug: string[];
}

export interface ContentPageProps {
  params: Promise<ContentPageParams>;
}

export interface SlugPageParams {
  slug: string;
}

export interface SlugPageProps {
  params: Promise<SlugPageParams>;
}

/**
 * Generic function to get content by slug from the URL
 */
export async function tryGetContentBySlug<T extends { url_slug: string }>(
  params: Promise<SlugPageParams>,
  serviceFunc: (slug: string) => Promise<T | null>,
) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const content = await serviceFunc(slug);

  if (!content) {
    notFound();
  }

  return content;
}

/**
 * Redirect handler for old /{table}/{id}/{slug} URLs.
 * Looks up the correct slug by ID and permanently redirects to /{plural}/{slug}.
 */
export async function redirectByIdToSlugUrl(
  table: string,
  params: Promise<ContentPageParams>,
) {
  const { idslug } = await params;
  const id = parseInt(idslug[0]);
  const plural = getPluralTableName(table);

  if (!id || isNaN(id)) {
    permanentRedirect(`/${plural}`);
  }

  const dbTable = table.replace("-", "_");
  const row = await getPrismaModel(dbTable).findUnique({
    where: { id },
    select: { url_slug: true },
  });

  if (!row) {
    notFound();
  }

  permanentRedirect(`/${plural}/${row.url_slug as string}`);
}

export function revalidateContent(table: string, slug?: string) {
  if (slug) {
    revalidatePath(getContentPath(table, slug));
  }

  // Revalidate the associated list page for the content, default is 5 minutes as well
  revalidateTag(`${table}-list`, "default");
}
