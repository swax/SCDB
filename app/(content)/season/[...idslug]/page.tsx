import AccordionHeader from "@/app/components/AccordionHeader";
import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getSeason,
  getSeasonSketchGrid,
  getSeasonsList,
} from "@/backend/content/seasonService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
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
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedSeason = cache(async (id: number) => getSeason(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const season = await getRequestCachedSeason(id);

  return season
    ? {
        title: buildPageTitle(
          `Season ${season.number} - ${season.show.title} ${season.year}`,
        ),
        description: `Comedy sketches from the ${season.year} ${season.show.title} season ${season.number}`,
      }
    : {};
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const seasons = await getSeasonsList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return seasons.list.map((season) => ({
    idslug: [season.id.toString(), season.url_slug],
  }));
}

export default async function SeasonPage({ params }: ContentPageProps) {
  // Data fetching
  const season = await tryGetContent("season", params, getRequestCachedSeason);

  async function getSketchData(page: number) {
    "use server";
    return await getSeasonSketchGrid(season.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box mt={4} mb={4}>
        <Typography component="h1" variant="h4">
          Season {season.number} ({season.year})
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="show" entry={season.show} />
        </Typography>
      </Box>
      <SketchGrid initialData={sketchData} getData={getSketchData} />
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
