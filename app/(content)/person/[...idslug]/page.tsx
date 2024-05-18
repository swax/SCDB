import { getPerson } from "@/backend/content/personService";
import { Typography } from "@mui/material";
import { ContentPageProps, getContent } from "../../contentBase";

export default async function PersonaPage({ params }: ContentPageProps) {
  const person = await getContent("person", params, getPerson);

  // Rendering
  return (
    <>
      <Typography variant="h4">{person.name}</Typography>
      <Typography variant="subtitle1">{person.description}</Typography>
    </>
  );
}
