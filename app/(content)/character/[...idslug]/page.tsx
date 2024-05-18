import { getCharacter } from "@/backend/content/characterService";
import { Typography } from "@mui/material";
import { ContentPageProps, getContent } from "../../contentBase";

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await getContent("character", params, getCharacter);

  // Rendering
  return (
    <>
      <Typography variant="h4">{character.name}</Typography>
      <Typography variant="subtitle1">{character.description}</Typography>
    </>
  );
}
