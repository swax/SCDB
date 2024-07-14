import AccordionHeader from "@/app/components/AccordionHeader";
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
import { buildPageTitle } from "@/shared/utilities";
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

const getRequestCachedShow = cache(async (id: number) => getShow(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const show = await getRequestCachedShow(id);

  return show
    ? {
        title: buildPageTitle(show.title),
        description: `Comedy sketches from the show ${show.title}`,
      }
    : {};
}

export async function generateStaticParams() {
  const shows = await getShowsList({ page: 1, pageSize: getStaticPageCount() });

  return shows.list.map((show) => ({
    idslug: [show.id.toString(), show.url_slug],
  }));
}

export default async function ShowPage({ params }: ContentPageProps) {
  // Data fetching
  const show = await tryGetContent("show", params, getRequestCachedShow);

  async function getSketchData(page: number) {
    "use server";
    return await getShowSketchGrid(show.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {show.title}
        </Typography>
        <Typography component="div" variant="subtitle1" color="textSecondary">
          <MuiNextLink href={"/shows"} prefetch={false}>
            Show
          </MuiNextLink>
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
            <AccordionHeader icon={<FormatListNumberedIcon />}>
              Seasons
            </AccordionHeader>
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
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
