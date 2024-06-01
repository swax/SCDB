import {
  getRecurringSketch,
  getRecurringSketchGrid,
  getRecurringSketchList,
} from "@/backend/content/recurringSketch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import Markdown from "react-markdown";
import SketchGrid from "../../SketchGrid";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";

export async function generateStaticParams() {
  const recurringSketches = await getRecurringSketchList({
    page: 1,
    pageSize: 1000,
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
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4">{recurringSketch.title}</Typography>
      </Box>
      {Boolean(recurringSketch.description) && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="description-content"
            id="description-header"
          >
            <NotesIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Description
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Markdown>{recurringSketch.description}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <DateGeneratedFooter />
    </>
  );
}
