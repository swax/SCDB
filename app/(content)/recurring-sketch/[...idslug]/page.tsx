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
import { Box, Typography } from "@mui/material";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

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
    getRecurringSketch,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getRecurringSketchGrid(recurringSketch.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  const pageTitle = recurringSketch.title + " - SketchTV.lol";

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={4} mb={4}>
        <Typography variant="h4">{recurringSketch.title}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          <MuiNextLink href={"/recurring-sketches"}>
            Recurring Sketch
          </MuiNextLink>
        </Typography>
      </Box>
      <DescriptionPanel description={recurringSketch.description} />
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <LinksPanel link_urls={recurringSketch.link_urls} />
      <DateGeneratedFooter />
    </>
  );
}
