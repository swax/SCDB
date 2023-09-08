"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ForumIcon from "@mui/icons-material/Forum";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotesIcon from "@mui/icons-material/Notes";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import SketchData from "./SketchData";
import style from "./page.module.css";

export default function Home() {
  // Hooks
  const [playerOpen, setPlayerOpen] = useState(false);

  // Event handlers
  function handleOpenPlayer() {
    setPlayerOpen(true);
  }

  function handleClosePlayer() {
    setPlayerOpen(false);
  }

  // Rendering
  const imgWidth = 400;
  const imgHeight = imgWidth * (9 / 16);

  return (
    <>
      <ResponsiveAppBar />
      <Container sx={{ mt: 1, pb: 4 }}>
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
        <Box marginTop={1}>
          <Typography variant="body1">{SketchData.teaser}</Typography>
        </Box>
        <Box marginTop={1}>
          <Stack direction="row" spacing={1}>
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
              <Stack direction="row" spacing={1}>
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
                Characters
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
      </Container>
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
      )}
    </>
  );
}
