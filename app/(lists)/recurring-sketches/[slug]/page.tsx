import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import MuiNextLink from "@/app/components/MuiNextLink";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getRecurringSketchBySlug,
  getRecurringSketchGrid,
  getRecurringSketchList,
} from "@/backend/content/recurringSketch";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import {
  buildPageMeta,
  getMetaImagesForSketchGrid,
} from "@/shared/metaBuilder";
import { getContentPath } from "@/shared/tableNames";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache, Suspense } from "react";
import SketchGrid from "@/app/components/SketchGrid";
import { SlugPageProps, tryGetContentBySlug } from "@/app/contentBase";

// Cached for the life of the request only
const getCachedRecurringSketch = cache(async (slug: string) =>
  getRecurringSketchBySlug(slug),
);
const getCachedRecurringSketchGrid = cache(async (id: number) =>
  getRecurringSketchGrid(id, 1),
);

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const recurringSketch = await getCachedRecurringSketch(slug);
  if (!recurringSketch) {
    return {};
  }

  const title = buildPageTitle(
    `${recurringSketch.title} - ${recurringSketch.show.title} Recurring`,
  );
  const description = `Comedy sketches in the '${recurringSketch.title}' series on ${recurringSketch.show.title}`;
  const sketches = await getCachedRecurringSketchGrid(recurringSketch.id);

  return buildPageMeta(
    title,
    description,
    getContentPath("recurring-sketch", recurringSketch.url_slug),
    getMetaImagesForSketchGrid(sketches, 3),
  );
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const recurringSketches = await getRecurringSketchList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return recurringSketches.list.map((recurringSketch) => ({
    slug: recurringSketch.url_slug,
  }));
}

export default async function RecurringSketchPage({ params }: SlugPageProps) {
  // Data fetching
  const recurringSketch = await tryGetContentBySlug(
    params,
    getCachedRecurringSketch,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getRecurringSketchGrid(recurringSketch.id, page);
  }

  const sketchData = await getCachedRecurringSketchGrid(recurringSketch.id);

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {recurringSketch.title}
        </Typography>
        <Typography component="div" variant="subtitle1" color="textSecondary">
          <MuiNextLink href={"/recurring-sketches"} prefetch={false}>
            Recurring Sketch
          </MuiNextLink>
          {" on "}
          <ContentLink mui table="show" entry={recurringSketch.show} />
        </Typography>
      </Box>
      <DescriptionPanel description={recurringSketch.description} />
      <Suspense fallback={<div>Loading sketches...</div>}>
        <SketchGrid initialData={sketchData} getData={getSketchData} />
      </Suspense>
      <LinksPanel link_urls={recurringSketch.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
