import { getPerson } from "@/backend/content/personService";
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { ContentPageProps, getContent } from "../../contentBase";
import s3url from "@/shared/cdnHost";
import Image from "next/image";

export default async function PersonaPage({ params }: ContentPageProps) {
  const person = await getContent("person", params, getPerson);

  // Rendering
  const imgHeight = 300;
  const imgWidth = imgHeight * (9 / 16);

  const age = person.birth_date
    ? (person.death_date || new Date()).getFullYear() -
      person.birth_date.getFullYear()
    : undefined;

  return (
    <>
      <Typography variant="h4">{person.name}</Typography>

      {/* birth, death, age */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {!!person.birth_date && (
          <Typography variant="subtitle1">
            B. {person.birth_date.toLocaleDateString()}
          </Typography>
        )}
        {!!person.death_date && (
          <Typography variant="subtitle1">
            D. {person.death_date.toLocaleDateString()}
          </Typography>
        )}
        {!!age && <Typography variant="subtitle1">Age: {age}</Typography>}
      </Box>

      <ImageList
        sx={{ display: "flex", flexWrap: "nowrap", gap: 8, padding: 1 }}
        cols={2.5}
      >
        {person.person_images.map((person_image, i) => (
          <ImageListItem key={i}>
            <Image
              alt={person_image.description || person.name}
              style={{ objectFit: "cover", borderRadius: 8 }}
              src={`${s3url}/${person_image.image.cdn_key}`}
              width={imgWidth}
              height={imgHeight}
            />
            {!!person_image.description && (
              <ImageListItemBar subtitle={person_image.description} />
            )}
          </ImageListItem>
        ))}
      </ImageList>
      <Typography variant="subtitle1">{person.description}</Typography>
    </>
  );
}
