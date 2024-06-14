import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import { getSketch, getSketchList } from "@/backend/content/sketchService";
import s3url from "@/shared/cdnHost";
import { enumNameToDisplayName } from "@/shared/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";
import SketchRating from "./components/SketchRating";
import VideoHero from "./components/VideoHero";
import LinksPanel from "@/app/components/LinksPanel";

export async function generateStaticParams() {
  const sketches = await getSketchList({ page: 1, pageSize: 1000 });

  return sketches.list.map((sketch) => ({
    idslug: [sketch.id.toString(), sketch.url_slug],
  }));
}

export default async function SketchPage({ params }: ContentPageProps) {
  // Data fetching
  const sketch = await tryGetContent("sketch", params, getSketch);

  type castMemberType = (typeof sketch.sketch_casts)[number];
  type combinedCastMemberType = castMemberType & {
    title: JSX.Element;
    tooltip: string;
  };

  // Combine cast members that are the same person/image - just the characters are different
  // ie in a sketch Taran Killam plays a character that is both Vin Diesel and Thumper, same picture
  const combinedCastMembers: combinedCastMemberType[] = [];

  for (const castMember of sketch.sketch_casts) {
    let combinedCastMember = combinedCastMembers.find(
      (ccm) =>
        castMember.person &&
        ccm.person?.id === castMember.person.id &&
        ccm.image?.cdn_key === castMember.image?.cdn_key,
    );

    if (combinedCastMember) {
      const title = getCastMemberTitle(castMember);
      combinedCastMember.tooltip += " / " + (castMember.character_name || "");
      combinedCastMember.title = (
        <>
          {combinedCastMember.title}
          {" / "}
          <br />
          {title}
        </>
      );
    } else {
      combinedCastMember = {
        ...castMember,
        tooltip: castMember.character_name || "",
        title: getCastMemberTitle(castMember),
      };
      combinedCastMembers.push(combinedCastMember);
    }
  }

  // Helper functions
  function getCastMemberTitle(castMember: castMemberType) {
    return (
      <>
        {castMember.character ? (
          <ContentLink mui table="character" entry={castMember.character} />
        ) : (
          <span>{castMember.character_name || ""}</span>
        )}
      </>
    );
  }
  
  // Rendering
  const pageTitle = sketch.title + " - SketchTV.lol";

  const imgWidth = 150;
  const imgHeight = 150;

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={3} mb={2}>
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
        <DescriptionPanel description={sketch.description} />
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
                        <Box title={castMember.tooltip}>{castMember.title}</Box>
                      }
                      subtitle={
                        <>
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
                        </>
                      }
                    />
                  </ImageListItem>
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
      <LinksPanel link_urls={sketch.link_urls} />
      <DateGeneratedFooter />
    </>
  );
}
