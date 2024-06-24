import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import MuiNextLink from "@/app/components/MuiNextLink";
import {
  getRecurringSketch,
  getRecurringSketchGrid,
  getRecurringSketchList,
} from "@/backend/content/recurringSketch";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedRecurringSketch = cache(async (id: number) =>
  getRecurringSketch(id),
);

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const recurringSketch = await getRequestCachedRecurringSketch(id);

  return recurringSketch
    ? {
        title: buildPageTitle(
          `${recurringSketch.title} - ${recurringSketch.show.title} Recurring`,
        ),
        description: `Comedy sketches in the '${recurringSketch.title}' series on ${recurringSketch.show.title}`,
      }
    : {};
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
    getRequestCachedRecurringSketch,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getRecurringSketchGrid(recurringSketch.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box mt={4} mb={4}>
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
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <LinksPanel link_urls={recurringSketch.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
