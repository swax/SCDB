import AccordionHeader from "@/app/components/AccordionHeader";
import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import staticUrl from "@/shared/cdnHost";
import { enumNameToDisplayName, toNiceDate } from "@/shared/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Image from "next/image";
import "server-only";
import SketchRating from "./components/SketchRating";
import VideoHero from "./components/VideoHero";
import { combinedCastMemberType, sketchType } from "./sketchTypes";

export default function SketchPageBody({
  sketch,
  combinedCastMembers,
}: {
  sketch: sketchType;
  combinedCastMembers: combinedCastMemberType[];
}) {
  // Rendering
  const imgWidth = 150;
  const imgHeight = 150;

  return (
    <>
      <Box style={{ marginTop: 24, marginBottom: 16 }}>
        <Typography component="h1" variant="h4">
          {sketch.title}
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="show" entry={sketch.show} />

          {!!sketch.season && (
            <>
              {" ("}
              <ContentLink mui table="season" entry={sketch.season} />
              {")"}
            </>
          )}
          {!!sketch.episode && (
            <>
              {" Episode "}
              <ContentLink mui table="episode" entry={sketch.episode}>
                <span
                  title={
                    sketch.episode.air_date
                      ? "Air Date " + toNiceDate(sketch.episode.air_date)
                      : ""
                  }
                >
                  {sketch.episode.number}
                </span>
              </ContentLink>
            </>
          )}
        </Typography>
      </Box>
      <VideoHero
        title={sketch.title}
        image_cdn_key={sketch.image?.cdn_key}
        videoUrls={sketch.video_urls}
      />
      {!!sketch.recurring_sketch && (
        <Typography component="div" variant="subtitle1" marginTop={2}>
          {"See more "}
          <ContentLink
            mui
            table="recurring-sketch"
            entry={sketch.recurring_sketch}
          />
        </Typography>
      )}
      <Box style={{ marginTop: 16 }}>
        {sketch.teaser && (
          <Paper elevation={0} style={{ padding: 16, marginBottom: 16 }}>
            <Typography
              component="div"
              variant="body1"
              style={{ whiteSpace: "pre-line" }}
            >
              {sketch.teaser}
            </Typography>
          </Paper>
        )}
        <SketchRating
          sketchId={sketch.id}
          slug={sketch.url_slug}
          siteRating={sketch.site_rating}
        />
        {Boolean(sketch.sketch_tags.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="tags-content"
              id="tags-header"
            >
              <AccordionHeader icon={<LocalOfferIcon />}>Tags</AccordionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                {sketch.sketch_tags.map((sketch_tag, i) => (
                  <ContentLink mui key={i} table="tag" entry={sketch_tag.tag}>
                    <Chip
                      clickable
                      label={
                        <span>
                          {sketch_tag.tag.category.name}&nbsp;/&nbsp;
                          {sketch_tag.tag.name}
                        </span>
                      }
                      variant="outlined"
                    />
                  </ContentLink>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
        {Boolean(sketch.sketch_casts.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="cast-content"
              id="cast-header"
            >
              <AccordionHeader icon={<GroupsIcon />}>Cast</AccordionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <ImageList
                aria-label="Cast Members"
                className="sketch-grid"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  margin: 0,
                }}
              >
                {combinedCastMembers.map((castMember, i) => (
                  <ImageListItem key={i} aria-label={castMember.tooltip}>
                    <ContentLink
                      mui
                      table={castMember.character ? "character" : "person"}
                      entry={castMember.character || castMember.person}
                    >
                      <Image
                        alt={castMember.tooltip}
                        title={castMember.tooltip}
                        style={{
                          objectFit: "cover",
                          objectPosition: "50% 0",
                          borderRadius: 8,
                        }}
                        src={
                          castMember.image?.cdn_key
                            ? `${staticUrl}/${castMember.image?.cdn_key}`
                            : "/images/no-image.webp"
                        }
                        width={imgWidth}
                        height={imgHeight}
                      />
                    </ContentLink>
                    <ImageListItemBar
                      title={
                        <Box
                          component="h3"
                          style={{
                            fontSize: "16px",
                            fontWeight: 400,
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={castMember.tooltip}
                        >
                          {castMember.title}
                        </Box>
                      }
                      subtitle={
                        <h4 style={{ margin: 0, fontWeight: 400 }}>
                          {!!castMember.person && (
                            <>
                              <ContentLink
                                table="person"
                                entry={castMember.person}
                              />
                              {" • "}
                            </>
                          )}
                          {enumNameToDisplayName(castMember.role)}
                        </h4>
                      }
                      sx={{
                        width: imgWidth,
                        "& .MuiImageListItemBar-subtitle": {
                          whiteSpace: "wrap",
                        },
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </AccordionDetails>
          </Accordion>
        )}
        {Boolean(sketch.sketch_quotes.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="quote-content"
              id="quote-header"
            >
              <AccordionHeader icon={<FormatQuoteIcon />}>
                Quotes
              </AccordionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {sketch.sketch_quotes.map((quote, i) => (
                  <Paper
                    key={i}
                    elevation={3}
                    style={{ marginBottom: 8, padding: 8 }}
                  >
                    <Typography
                      component="div"
                      variant="body2"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {quote.quote}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
        <DescriptionPanel description={sketch.synopsis} title="Synopsis" />
        <DescriptionPanel description={sketch.notes} title="Notes" />
        {Boolean(sketch.sketch_credits.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="credit-content"
              id="credit-header"
            >
              <AccordionHeader icon={<GroupsIcon />}>Credits</AccordionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table aria-label="simple table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Person</TableCell>
                      <TableCell>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sketch.sketch_credits.map((sketch_credit, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {!!sketch_credit.person.person_images.length && (
                            <Image
                              alt={sketch_credit.person.name}
                              style={{ objectFit: "cover" }}
                              src={`${staticUrl}/${sketch_credit.person.person_images[0].image.cdn_key}`}
                              height={40}
                              width={40}
                            />
                          )}
                        </TableCell>
                        <TableCell style={{ whiteSpace: "nowrap" }}>
                          <ContentLink
                            mui
                            table="person"
                            entry={sketch_credit.person}
                          />
                        </TableCell>
                        <TableCell>
                          {enumNameToDisplayName(sketch_credit.role)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
      <LinksPanel link_urls={sketch.link_urls} />
    </>
  );
}
