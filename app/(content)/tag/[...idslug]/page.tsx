import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getTag,
  getTagSketchGrid,
  getTagsList,
} from "@/backend/content/tagService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import staticUrl from "@/shared/cdnHost";
import { buildPageMeta } from "@/shared/metaBuilder";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedTag = cache(async (id: number) => getTag(id));
const getRequestCachedSketchGrid = cache(async (id: number, page: number) =>
  getTagSketchGrid(id, page),
);

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const tag = await getRequestCachedTag(id);
  if (!tag) {
    return {};
  }

  const title = buildPageTitle(tag.name);
  const description = `Comedy sketches tagged with ${tag.name}`;
  const sketches = await getRequestCachedSketchGrid(id, 1);
  const images = sketches.sketches
    .map((sketch) => ({
      url: `${staticUrl}/${sketch.image_cdnkey}`,
      alt: sketch.titleString,
    }))
    .slice(0, 3);

  return buildPageMeta(
    title,
    description,
    `/tag/${tag.id}/${tag.url_slug}`,
    images,
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
  const tag = await tryGetContent("tag", params, getRequestCachedTag);

  async function getSketchData(page: number) {
    "use server";
    return await getRequestCachedSketchGrid(tag.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box mt={4} mb={4}>
        <Typography component="h1" variant="h4">
          {tag.name}
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="category" entry={tag.category} />
        </Typography>
      </Box>
      <DescriptionPanel description={tag.description} />
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <LinksPanel link_urls={tag.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
