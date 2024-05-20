import { getCharacter } from "@/backend/content/characterService";
import { Typography } from "@mui/material";
import { ContentPageProps, getCachedContent } from "../../contentBase";

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await getCachedContent("character", params, getCharacter);

  // Rendering
  return (
    <>
      <Typography variant="h4">{character.name}</Typography>
      <Typography variant="subtitle1">{character.description}</Typography>
    </>
  );
}
