import prisma from "@/database/prisma";
import type { Prisma } from "@/database/generated/client";
import { ApiError } from "./apiAuth";
import { matchingSourceKeys, sourceVideoKey } from "@/shared/sourceVideo";

type SourceRow = {
  id: number;
  title: string;
  url_slug: string;
  video_urls: string[];
};
type SourceReader = {
  sketch: {
    findMany: (args: {
      select: { id: true; title: true; url_slug: true; video_urls: true };
    }) => Promise<SourceRow[]>;
  };
};

export async function findSketchesBySource(
  urls: string[],
  db: SourceReader = prisma,
) {
  const keys = new Set(
    urls.map(sourceVideoKey).filter((key): key is string => !!key),
  );
  if (!keys.size) return [];
  // Read source arrays, not the full-text index (which deliberately omits URLs).
  // This also covers legacy URL variants without a data migration.
  const rows = await db.sketch.findMany({
    select: { id: true, title: true, url_slug: true, video_urls: true },
  });
  return rows.flatMap((row) => {
    const sources = matchingSourceKeys(row.video_urls, keys);
    return sources.length
      ? [{ id: row.id, title: row.title, url_slug: row.url_slug, sources }]
      : [];
  });
}

/** Serialize API creates sharing a source across processes, including URL aliases.
 * The duplicate check and CMS write share the same database transaction.
 * Intentionally shared compilation sources require the explicit API override.
 */
export async function withSourceGuard<T>(
  urls: string[],
  allowSharedSource: boolean,
  create: (tx?: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const keys = [
    ...new Set(urls.map(sourceVideoKey).filter((key): key is string => !!key)),
  ].sort();
  if (!keys.length || allowSharedSource) return create();
  return prisma.$transaction(
    async (tx) => {
      for (const key of keys) {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))::text`;
      }
      const matches = await findSketchesBySource(urls, tx);
      if (matches.length)
        throw new ApiError(
          409,
          `Source video already exists in sketch(es): ${matches.map((match) => `${match.id} (${match.url_slug})`).join(", ")}. Reuse the existing record; allow_shared_source is only for intentional compilation/shared-video entries.`,
        );
      return create(tx);
    },
    { timeout: 30000, maxWait: 5000 },
  );
}
