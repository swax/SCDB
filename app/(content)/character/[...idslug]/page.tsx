import {
  getCharacter,
  getCharacterList,
} from "@/backend/content/characterService";
import s3url from "@/shared/cdnHost";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ImageListItem,
  ImageListItemBar,
  Link,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Markdown from "react-markdown";
import {
  ContentPageProps,
  DateGeneratedFooter,
  getCachedContent,
} from "../../contentBase";
import LiveTvIcon from "@mui/icons-material/LiveTv";

export async function generateStaticParams() {
  const characters = await getCharacterList({ page: 1, pageSize: 1000 });

  return characters.list.map((character) => ({
    idslug: [character.id.toString(), character.url_slug],
  }));
}

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await getCachedContent("character", params, getCharacter);

  // Rendering
  /*const copy1 = structuredClone(character.sketch_casts);
  const copy2 = structuredClone(character.sketch_casts);
  character.sketch_casts.push(...copy1);
  character.sketch_casts.push(...copy2);*/

  const imgWidth = 250;
  const imgHeight = Math.round(imgWidth / 1.75);

  return (
    <>
      <Typography variant="h4" mb={4}>
        {character.name}
      </Typography>
      {Boolean(character.description) && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="about-content"
            id="about-header"
          >
            <NotesIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              About
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Markdown>{character.description}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
      {!!character.sketch_casts && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sketches-content"
            id="sketches-header"
          >
            <LiveTvIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Sketches
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {character.sketch_casts.map((sc, i) => (
                <ImageListItem
                  key={i}
                  component={Link}
                  href={`/sketch/${sc.sketch.id}/${sc.sketch.url_slug}`}
                >
                  <Image
                    alt={sc.sketch.title}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                    src={`${s3url}/${sc.image?.cdn_key || sc.sketch.sketch_images?.[0].image.cdn_key || "/images/no-image.webp"}`}
                    width={imgWidth}
                    height={imgHeight}
                  />
                  <ImageListItemBar
                    title={sc.sketch.title}
                    subtitle={`${sc.person?.name} • ${sc.sketch.show.title} (${sc.sketch.season?.year})`}
                  />
                </ImageListItem>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      )}

      <DateGeneratedFooter dateGenerated={character.dateGenerated} />
    </>
  );
}
