import {
  getCharacter,
  getCharacterList,
  getCharacterSketches,
} from "@/backend/content/characterService";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Link,
  Typography,
} from "@mui/material";
import Markdown from "react-markdown";
import SketchAccordian from "../../SketchAccordian";
import {
  ContentPageProps,
  DateGeneratedFooter,
  getCachedContent,
} from "../../contentBase";

export async function generateStaticParams() {
  const characters = await getCharacterList({ page: 1, pageSize: 1000 });

  return characters.list.map((character) => ({
    idslug: [character.id.toString(), character.url_slug],
  }));
}

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await getCachedContent("character", params, getCharacter);

  const sketchData = await getCharacterSketches(character.id, 0, 9);

  const sketches = sketchData.list.map((sc) => ({
    id: sc.sketch.id,
    url_slug: sc.sketch.url_slug,
    title: sc.sketch.title,
    subtitle: `${sc.person?.name} • ${sc.sketch.show.title} (${sc.sketch.season?.year})`,
    image_cdnkey: sc.image?.cdn_key || sc.sketch.image?.cdn_key,
  }));

  // Rendering
  return (
    <>
      <Typography variant="h4">{character.name}</Typography>
      {Boolean(character.person) && (
        <Typography variant="subtitle1" mb={4}>
          The Character,{" "}
          <Link
            href={`/person/${character.person?.id}/${character.person?.url_slug}`}
          >
            The Person
          </Link>
        </Typography>
      )}
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
      <SketchAccordian sketches={sketches} />

      <DateGeneratedFooter dateGenerated={character.dateGenerated} />
    </>
  );
}
