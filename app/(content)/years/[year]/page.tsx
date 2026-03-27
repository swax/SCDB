import SketchGrid from "@/app/components/SketchGrid";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getYearSketchGrid } from "@/backend/content/sketchService";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

interface YearPageProps {
  params: Promise<{ year: string }>;
}

/** Parse "2019" as a single year or "1990s" as a decade range */
function parseYearParam(year: string) {
  const decadeMatch = year.match(/^(\d{3})0s$/);
  if (decadeMatch) {
    const decadeStart = parseInt(decadeMatch[1] + "0");
    return {
      label: `the ${year}`,
      filter: { year: { gte: decadeStart, lt: decadeStart + 10 } },
    };
  }

  const yearInt = parseInt(year);
  if (isNaN(yearInt)) return null;

  return {
    label: year,
    filter: { year: yearInt },
  };
}

export async function generateMetadata({
  params,
}: YearPageProps): Promise<Metadata> {
  const { year } = await params;
  const parsed = parseYearParam(year);
  if (!parsed) return {};

  return {
    title: buildPageTitle(`Sketches from ${parsed.label}`),
    description: `A list of comedy sketches from ${parsed.label}`,
  };
}

export const revalidate = 300;

export default async function YearPage(props: YearPageProps) {
  const { year } = await props.params;
  const parsed = parseYearParam(year);

  if (!parsed) {
    notFound();
  }

  const { filter } = parsed;

  const getCachedGrid = cache(async () =>
    getYearSketchGrid(filter, 1),
  );

  const sketchData = await getCachedGrid();

  async function getSketchData(page: number) {
    "use server";
    return await getYearSketchGrid(filter, page);
  }

  return (
    <>
      <Box style={{ marginTop: 24, marginBottom: 16 }}>
        <Typography component="h1" variant="h4">
          Sketches from {parsed.label}
        </Typography>
      </Box>
      <Suspense fallback={<div>Loading sketches...</div>}>
        <SketchGrid initialData={sketchData} getData={getSketchData} />
      </Suspense>
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
