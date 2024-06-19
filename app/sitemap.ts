/*
 * From the sketch pages, everything else should be discoverable by the search engine (tags, people, characters, etc..)
 * In development the site map is located at /sitemap.xml/0
 * In production /sitemap/0.xml
 * Currently set to cache with a 10 minute revalidation
 */

import { getSketchSitemap } from "@/backend/content/sketchService";
import { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";

export function generateSitemaps() {
  return [{ id: 0 }];
}

/**
 * This does take an id parameter that matches the above,
 * but it's not need until there are over 50,000 items in the sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await getCachedSiteMap();
}

const getCachedSiteMap = unstable_cache(
  async () => getSketchSitemap(),
  ["sitemap"],
  {
    revalidate: 10 * 60, // 10 minutes
  },
);
