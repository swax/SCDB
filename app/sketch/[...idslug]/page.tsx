import { getSketch } from "@/backend/content/sketchService";
import { notFound, redirect } from "next/navigation";
import { SketchClientPage } from "./page.client";
import { Typography } from "@mui/material";
import VideoHero from "./components/VideoHero";

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
  const show = sketch.episode.season.show;

  console.log(sketch);
  return (
    <>
      <Typography variant="h4">{sketch.title}</Typography>
      <Typography variant="subtitle1">
        {show.title} ({sketch.episode.season.year})
      </Typography>
      <VideoHero
        title={sketch.title}
        previewImgCdnKey={sketch.sketch_images[0]?.image.cdn_key}
        videoEmbedUrl={sketch.video_urls[0]}
      />
    </>
  );
}

/*
      <Typography variant="h4">{SketchData.title}</Typography>
      <Typography variant="subtitle1">
        {SketchData.show.title} ({SketchData.season.year})
      </Typography>
      <Box>
        <div
          onClick={handleOpenPlayer}
          style={{
            borderRadius: 8,
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            width: imgWidth,
            height: imgHeight,
          }}
        >
          <Image
            alt={SketchData.title}
            fill
            objectFit="cover"
            src={SketchData.preview_img.url}
          />
        </div>
      </Box>
      ------------------------
      <Box marginTop={1}>
        <Typography variant="body1">{SketchData.teaser}</Typography>
      </Box>
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
            aria-controls="panel0a-content"
            id="panel0a-header"
          >
            <LocalOfferIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Tags
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
              {SketchData.tags.map((tag, i) => (
                <Chip
                  clickable
                  key={i}
                  label={
                    <span>
                      {tag.category}&nbsp;/&nbsp;{tag.name}
                    </span>
                  }
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <GroupsIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              People
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table aria-label="simple table">
                <TableBody>
                  {SketchData.characters.map((character, i) => (
                    <TableRow key={i}>
                      <TableCell>{character.character.name}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        ({character.actor.name}{" "}
                        {character.actor.guestStar && (
                          <span title="Guest Star">⭐</span>
                        )}
                        )
                      </TableCell>
                      <TableCell>{character.summary}</TableCell>
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
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <NotesIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Detailed Summary
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {SketchData.summary}
            </Typography>
          </AccordionDetails>
        </Accordion>
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
      </Box>
      {playerOpen && (
        <Backdrop
          onClick={handleClosePlayer}
          open={true}
          sx={{
            backgroundColor: "#000d",
            color: "white",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <iframe
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            src={SketchData.embedUrl}
            title="YouTube video player"
            width="800"
            height="600"
          ></iframe>
        </Backdrop>
      )}*/
