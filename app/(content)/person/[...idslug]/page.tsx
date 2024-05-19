import { getPerson } from "@/backend/content/personService";
import { Box, ImageList, ImageListItem, Typography } from "@mui/material";
import { ContentPageProps, getContent } from "../../contentBase";
import s3url from "@/shared/cdnHost";
import Image from "next/image";

export default async function PersonaPage({ params }: ContentPageProps) {
  const person = await getContent("person", params, getPerson);

  // Rendering
  const imgHeight = 300;
  const imgWidth = imgHeight * (9 / 16);

  return (
    <>
      <Typography variant="h4">{person.name}</Typography>

      <ImageList sx={{ display: "flex", flexWrap: "nowrap", gap: 8, padding: 1 }} cols={2.5}>
        {person.person_images.map((person_image, i) => (
          <ImageListItem key={i}>
            <Image
              alt={person.name}
              style={{ objectFit: "cover", borderRadius: 8 }}
              src={`${s3url}/${person_image.image.cdn_key}`}
              width={imgWidth}
              height={imgHeight}
            />
          </ImageListItem>
        ))}
      </ImageList>
      <Typography variant="subtitle1">{person.description}</Typography>
    </>
  );
}
