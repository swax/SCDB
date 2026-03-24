import AccordionHeader from "@/app/components/AccordionHeader";
import { ContentLink } from "@/app/components/ContentLink";
import LinksPanel from "@/app/components/LinksPanel";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getSeasonBySlug,
  getSeasonSketchGrid,
  getSeasonsList,
} from "@/backend/content/seasonService";
import { SlugPageProps, tryGetContentBySlug } from "@/app/contentBase";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import {
  buildPageMeta,
  getMetaImagesForSketchGrid,
} from "@/shared/metaBuilder";
import { getContentPath } from "@/shared/tableNames";
import { buildPageTitle, toNiceDate } from "@/shared/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Metadata } from "next";
import { cache, Suspense } from "react";
import SketchGrid from "@/app/components/SketchGrid";

// Cached for the life of the request only
const getCachedSeason = cache(async (slug: string) => getSeasonBySlug(slug));
const getCachedSeasonSketchGrid = cache(async (id: number) =>
  getSeasonSketchGrid(id, 1),
);

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const season = await getCachedSeason(slug);
  if (!season) {
    return {};
  }

  const title = buildPageTitle(
    `Season ${season.number} - ${season.show.title} ${season.year}`,
  );
  const description = `Comedy sketches from the ${season.year} ${season.show.title} season ${season.number}`;
  const sketches = await getCachedSeasonSketchGrid(season.id);

  return buildPageMeta(
    title,
    description,
    getContentPath("season", season.url_slug),
    getMetaImagesForSketchGrid(sketches, 3),
  );
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const seasons = await getSeasonsList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return seasons.list.map((season) => ({
    slug: season.url_slug,
  }));
}

export default async function SeasonPage({ params }: SlugPageProps) {
  // Data fetching
  const season = await tryGetContentBySlug(params, getCachedSeason);

  async function getSketchData(page: number) {
    "use server";
    return await getSeasonSketchGrid(season.id, page);
  }

  const sketchData = await getCachedSeasonSketchGrid(season.id);

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          Season {season.number} ({season.year})
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="show" entry={season.show} />
        </Typography>
      </Box>
      <Suspense fallback={<div>Loading sketches...</div>}>
        <SketchGrid initialData={sketchData} getData={getSketchData} />
      </Suspense>
      {!!season.episodes.length && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="episodes-content"
            id="episodes-header"
          >
            <AccordionHeader icon={<FormatListNumberedIcon />}>
              Episodes
            </AccordionHeader>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Sketches</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {season.episodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell>
                      <ContentLink mui table="episode" entry={episode}>
                        {episode.number}
                      </ContentLink>
                    </TableCell>
                    <TableCell>
                      {episode.air_date ? toNiceDate(episode.air_date) : ""}
                    </TableCell>
                    <TableCell>{episode._count.sketches}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
      <LinksPanel link_urls={season.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
