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

/* After 50,000 urls this can be used to split the sitemap into multiple files
export function generateSitemaps() {
  return [{ id: 0 }];
} */

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
