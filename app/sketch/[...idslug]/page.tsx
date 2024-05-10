import { getSketch } from "@/backend/content/sketchService";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotesIcon from "@mui/icons-material/Notes";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { notFound, redirect } from "next/navigation";
import Markdown from "react-markdown";
import VideoHero from "./components/VideoHero";
import Image from "next/image";
import s3url from "@/shared/cdnHost";

export default async function SketchPage({
  params,
}: {
  params: { idslug: string[] };
}) {
  // Validate slug and redirect if invalid
  const [id, slug] = params.idslug;

  const sketch = await getSketch(parseInt(id));

  if (!sketch) {
    notFound();
  }

  if (slug !== sketch.url_slug) {
    redirect(`/sketch/${id}/${sketch.url_slug}`);
  }

  // Rendering
  return (
    <>
      <Typography variant="h4">{sketch.title}</Typography>
      <Typography variant="subtitle1">
        {sketch.show.title} ({sketch.season?.year || "Unknown Year"})
      </Typography>
      <VideoHero
        title={sketch.title}
        previewImgCdnKey={sketch.sketch_images[0]?.image.cdn_key}
        videoEmbedUrl={sketch.video_urls[0]}
      />

      <Box sx={{ marginTop: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="tags-content"
            id="tags-header"
          >
            <LocalOfferIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Tags
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
              {sketch.sketch_tags.map((sketch_tag, i) => (
                <Chip
                  clickable
                  key={i}
                  label={
                    <span>
                      {sketch_tag.tag.tag_category.name}&nbsp;/&nbsp;
                      {sketch_tag.tag.name}
                    </span>
                  }
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
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
            <Markdown>{sketch.description}</Markdown>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="cast-content"
            id="cast-header"
          >
            <GroupsIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Cast
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table aria-label="simple table">
                <TableBody>
                  {sketch.sketch_casts.map((sketch_cast, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {Boolean(sketch_cast.image) && (
                          <Image
                            alt={sketch_cast.character?.name || "Unknown"}
                            objectFit="cover"
                            src={`${s3url}/${sketch_cast.image?.cdn_key}`}
                            height={50}
                            width={50}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {sketch_cast.character?.name || "Unknown"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        ({sketch_cast.person?.name || ""})
                      </TableCell>
                      <TableCell>{sketch_cast.role}</TableCell>
                      <TableCell>{sketch_cast.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
}

/*

      <Box marginTop={1}>
        <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
          {SketchData.links.map((link, i) => (
            <Chip
              clickable
              component="a"
              href={link.url}
              key={i}
              label={link.text}
              size="small"
              target="_blank"
              variant="outlined"
            />
          ))}
        </Stack>
      </Box>
      <Box marginTop={2}>
        <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
      </Box>
      <Box sx={{ marginTop: 2 }}>
  
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
          >
            <FormatQuoteIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Quotes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableBody>
                  {SketchData.quotes.map((quote, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography
                          key={i}
                          variant="body2"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {quote.text}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4a-content"
            id="panel4a-header"
          >
            <StickyNote2Icon />
            <Typography fontWeight="bold" marginLeft={1}>
              Notes and Trivia
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {SketchData.notesAndTrivia}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <Button variant="outlined" startIcon={<ForumIcon />}>
          Discuss on Discord
        </Button>
      </Box>*/
