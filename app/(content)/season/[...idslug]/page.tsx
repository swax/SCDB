import { ContentLink } from "@/app/components/ContentLink";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getSeason,
  getSeasonSketchGrid,
  getSeasonsList,
} from "@/backend/content/seasonService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
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
import SketchGrid from "../../SketchGrid";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";

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
  const season = await tryGetContent("season", params, getSeason);

  async function getSketchData(page: number) {
    "use server";
    return await getSeasonSketchGrid(season.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  const pageTitle = `Season ${season.number} - ${season.show.title} ${season.year} - SketchTV.lol`;

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={4} mb={4}>
        <Typography variant="h4">
          Season {season.number} ({season.year})
        </Typography>
        <Typography variant="subtitle1">
          <ContentLink mui table="show" entry={season.show} />
        </Typography>
      </Box>
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      {!!season.episodes.length && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="about-content"
            id="about-header"
          >
            <FormatListNumberedIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Episodes
            </Typography>
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
                      {episode.air_date
                        ? episode.air_date.toLocaleDateString()
                        : ""}
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
      <DateGeneratedFooter />
    </>
  );
}
