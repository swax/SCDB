import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import s3url from "@/shared/cdnHost";
import { enumNameToDisplayName } from "@/shared/utilities";
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
      <Box mt={3} mb={2}>
        <Typography component="h1" variant="h4">
          {sketch.title}
        </Typography>
        <Typography variant="subtitle1">
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
                {sketch.episode.air_date
                  ? sketch.episode.air_date.toLocaleDateString()
                  : sketch.episode.number}
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
        <Typography variant="subtitle1">
          {"See more "}
          <ContentLink
            mui
            table="recurring-sketch"
            entry={sketch.recurring_sketch}
          />
        </Typography>
      )}
      <Box sx={{ marginTop: 2 }}>
        <SketchRating
          sketchId={sketch.id}
          slug={sketch.url_slug}
          siteRating={sketch.site_rating}
        />
        <DescriptionPanel description={sketch.description} />
        <DescriptionPanel description={sketch.notes} title="Notes" />
        {Boolean(sketch.sketch_casts.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="cast-content"
              id="cast-header"
            >
              <GroupsIcon />
              <Typography
                fontWeight="bold"
                marginLeft={1}
                component="h2"
                variant="body1"
              >
                Cast
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                className="sketch-grid"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {combinedCastMembers.map((castMember, i) => (
                  <ImageListItem key={i}>
                    <ContentLink
                      mui
                      table={castMember.character ? "character" : "person"}
                      entry={castMember.character || castMember.person}
                    >
                      <Image
                        alt={castMember.character_name || ""}
                        title={castMember.character_name || ""}
                        style={{
                          objectFit: "cover",
                          objectPosition: "50% 0",
                          borderRadius: 8,
                        }}
                        src={
                          castMember.image?.cdn_key
                            ? `${s3url}/${castMember.image?.cdn_key}`
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
                          sx={{
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
              </Box>
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
              <FormatQuoteIcon />
              <Typography
                fontWeight="bold"
                marginLeft={1}
                component="h2"
                variant="body1"
              >
                Quotes
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {sketch.sketch_quotes.map((quote, i) => (
                  <Paper
                    key={i}
                    elevation={3}
                    sx={{ marginBottom: 1, padding: 1 }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {quote.quote}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
        {Boolean(sketch.sketch_credits.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="credit-content"
              id="credit-header"
            >
              <GroupsIcon />
              <Typography
                fontWeight="bold"
                marginLeft={1}
                component="h2"
                variant="body1"
              >
                Credits
              </Typography>
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
                              src={`${s3url}/${sketch_credit.person.person_images[0].image.cdn_key}`}
                              height={40}
                              width={40}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
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
        {Boolean(sketch.sketch_tags.length) && (
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="tags-content"
              id="tags-header"
            >
              <LocalOfferIcon />
              <Typography
                fontWeight="bold"
                marginLeft={1}
                component="h2"
                variant="body1"
              >
                Tags
              </Typography>
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
                      size="small"
                      variant="outlined"
                    />
                  </ContentLink>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
      <LinksPanel link_urls={sketch.link_urls} />
    </>
  );
}
