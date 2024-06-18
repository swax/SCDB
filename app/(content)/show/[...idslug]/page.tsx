import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import MuiNextLink from "@/app/components/MuiNextLink";
import {
  getShow,
  getShowSketchGrid,
  getShowsList,
} from "@/backend/content/showService";
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
import { ContentPageProps, tryGetContent } from "../../contentBase";

export async function generateStaticParams() {
  const shows = await getShowsList({ page: 1, pageSize: getStaticPageCount() });

  return shows.list.map((show) => ({
    idslug: [show.id.toString(), show.url_slug],
  }));
}

export default async function ShowPage({ params }: ContentPageProps) {
  // Data fetching
  const show = await tryGetContent("show", params, getShow);

  async function getSketchData(page: number) {
    "use server";
    return await getShowSketchGrid(show.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  const pageTitle = show.title + " - SketchTV.lol";

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={4} mb={4}>
        <Typography variant="h4">{show.title}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          <MuiNextLink href={"/shows"}>Show</MuiNextLink>
        </Typography>
      </Box>
      <DescriptionPanel description={show.description} />
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      {!!show.seasons.length && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="seasons-content"
            id="seasons-header"
          >
            <FormatListNumberedIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Seasons
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Sketches</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {show.seasons.map((season) => (
                  <TableRow key={season.id}>
                    <TableCell>
                      <ContentLink mui table="season" entry={season}>
                        {season.number}
                      </ContentLink>
                    </TableCell>
                    <TableCell>{season.year}</TableCell>
                    <TableCell>{season._count.sketches}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
      <LinksPanel link_urls={show.link_urls} />
      <DateGeneratedFooter />
    </>
  );
}
