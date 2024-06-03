import { ContentLink } from "@/app/components/ContentLink";
import { getSketch, getSketchList } from "@/backend/content/sketchService";
import s3url from "@/shared/cdnHost";
import { enumNameToDisplayName } from "@/shared/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  ImageListItem,
  ImageListItemBar,
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
import Markdown from "react-markdown";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";
import SketchRating from "./components/SketchRating";
import VideoHero from "./components/VideoHero";

export async function generateStaticParams() {
  const sketches = await getSketchList({ page: 1, pageSize: 1000 });

  return sketches.list.map((sketch) => ({
    idslug: [sketch.id.toString(), sketch.url_slug],
  }));
}

export default async function SketchPage({ params }: ContentPageProps) {
  // Data fetching
  const sketch = await tryGetContent("sketch", params, getSketch);

  // Rendering
  const pageTitle = sketch.title + " - SketchTV.lol";

  const imgWidth = 175;
  const imgHeight = 175;

  return (
    <>
      <title>{pageTitle}</title>
      <Box mb={2}>
        <Typography variant="h4">{sketch.title}</Typography>
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
        <SketchRating sketchId={sketch.id} siteRating={sketch.site_rating} />
        {Boolean(sketch.description) && (
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
        )}
        {Boolean(sketch.sketch_casts.length) && (
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
              <Box
                className="sketch-grid"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                {sketch.sketch_casts.map((sketch_cast, i) => (
                  <ContentLink
                    key={i}
                    mui
                    table="character"
                    entry={sketch_cast.character}
                  >
                    <ImageListItem>
                      <Image
                        alt={sketch_cast.character_name || ""}
                        title={sketch_cast.character_name || ""}
                        style={{
                          objectFit: "cover",
                          objectPosition: "50% 0",
                          borderRadius: 8,
                        }}
                        src={
                          sketch_cast.image?.cdn_key
                            ? `${s3url}/${sketch_cast.image?.cdn_key}`
                            : "/images/no-image.webp"
                        }
                        width={imgWidth}
                        height={imgHeight}
                      />
                      <ImageListItemBar
                        title={
                          <>
                            {sketch_cast.character ? (
                              <ContentLink
                                mui
                                table="character"
                                entry={sketch_cast.character}
                              />
                            ) : (
                              <span title={sketch_cast.character_name || ""}>
                                {sketch_cast.character_name || ""}
                              </span>
                            )}
                          </>
                        }
                        subtitle={
                          <>
                            {!!sketch_cast.person && (
                              <>
                                <ContentLink
                                  table="person"
                                  entry={sketch_cast.person}
                                />
                                {" • "}
                              </>
                            )}
                            {enumNameToDisplayName(sketch_cast.role)}
                          </>
                        }
                      />
                    </ImageListItem>
                  </ContentLink>
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
              <Typography fontWeight="bold" marginLeft={1}>
                Credit
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
              <Typography fontWeight="bold" marginLeft={1}>
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
      <DateGeneratedFooter />
    </>
  );
}
