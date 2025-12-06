import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getTag,
  getTagSketchGrid,
  getTagsList,
} from "@/backend/content/tagService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import {
  buildPageMeta,
  getMetaImagesForSketchGrid,
} from "@/shared/metaBuilder";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache, Suspense } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

// Cached for the life of the request only
const getCachedTag = cache(async (id: number) => getTag(id));
const getCachedTagSketchGrid = cache(async (id: number) =>
  getTagSketchGrid(id, 1),
);

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.idslug[0]);

  const tag = await getCachedTag(id);
  if (!tag) {
    return {};
  }

  const title = buildPageTitle(tag.name);
  const description = `Comedy sketches tagged with ${tag.name}`;
  const sketches = await getCachedTagSketchGrid(id);

  return buildPageMeta(
    title,
    description,
    `/tag/${tag.id}/${tag.url_slug}`,
    getMetaImagesForSketchGrid(sketches, 3),
  );
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const tag = await getTagsList({ page: 1, pageSize: getStaticPageCount() });

  return tag.list.map((tag) => ({
    idslug: [tag.id.toString(), tag.url_slug],
  }));
}

export default async function TagPage({ params }: ContentPageProps) {
  const tag = await tryGetContent("tag", params, getCachedTag);

  async function getSketchData(page: number) {
    "use server";
    return await getTagSketchGrid(tag.id, page);
  }

  const sketchData = await getCachedTagSketchGrid(tag.id);

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {tag.name}
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="category" entry={tag.category} />
        </Typography>
      </Box>
      <DescriptionPanel description={tag.description} />
      <Suspense fallback={<div>Loading sketches...</div>}>
        <SketchGrid initialData={sketchData} getData={getSketchData} />
      </Suspense>
      <LinksPanel link_urls={tag.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
