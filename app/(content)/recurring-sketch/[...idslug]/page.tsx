import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import MuiNextLink from "@/app/components/MuiNextLink";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getRecurringSketch,
  getRecurringSketchGrid,
  getRecurringSketchList,
} from "@/backend/content/recurringSketch";
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
const getCachedRecurringSketch = cache(async (id: number) =>
  getRecurringSketch(id),
);
const getCachedRecurringSketchGrid = cache(async (id: number) =>
  getRecurringSketchGrid(id, 1),
);

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.idslug[0]);

  const recurringSketch = await getCachedRecurringSketch(id);
  if (!recurringSketch) {
    return {};
  }

  const title = buildPageTitle(
    `${recurringSketch.title} - ${recurringSketch.show.title} Recurring`,
  );
  const description = `Comedy sketches in the '${recurringSketch.title}' series on ${recurringSketch.show.title}`;
  const sketches = await getCachedRecurringSketchGrid(id);

  return buildPageMeta(
    title,
    description,
    `/recurring-sketch/${recurringSketch.id}/${recurringSketch.url_slug}`,
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
    idslug: [recurringSketch.id.toString(), recurringSketch.url_slug],
  }));
}

export default async function RecurringSketchPage({
  params,
}: ContentPageProps) {
  // Data fetching
  const recurringSketch = await tryGetContent(
    "recurring-sketch",
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
