import {
  getCharacter,
  getCharacterList,
} from "@/backend/content/characterService";
import { Typography } from "@mui/material";
import {
  ContentPageProps,
  DateGeneratedFooter,
  getCachedContent,
} from "../../contentBase";

export async function generateStaticParams() {
  const characters = await getCharacterList(1, 1000);

  return characters.list.map((character) => ({
    idslug: [character.id.toString(), character.url_slug],
  }));
}

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await getCachedContent("character", params, getCharacter);

  // Rendering
  return (
    <>
      <Typography variant="h4">{character.name}</Typography>
      <Typography variant="subtitle1">{character.description}</Typography>
      <DateGeneratedFooter dateGenerated={character.dateGenerated} />
    </>
  );
}
