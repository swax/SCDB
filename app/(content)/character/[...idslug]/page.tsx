import { ContentLink } from "@/app/components/ContentLink";
import {
  getCharacter,
  getCharacterList,
  getCharacterSketchGrid,
} from "@/backend/content/characterService";
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
  const characters = await getCharacterList({ page: 1, pageSize: 1000 });

  return characters.list.map((character) => ({
    idslug: [character.id.toString(), character.url_slug],
  }));
}

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await tryGetContent("character", params, getCharacter);

  async function getSketchData(page: number) {
    "use server";
    return await getCharacterSketchGrid(character.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4">{character.name}</Typography>
        {!!character.person && (
          <Typography variant="subtitle1">
            The Character,{" "}
            <ContentLink mui table="person" entry={character.person}>
              The Person
            </ContentLink>
          </Typography>
        )}
      </Box>
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
      <SketchGrid initialData={sketchData} getData={getSketchData} />

      <DateGeneratedFooter />
    </>
  );
}
