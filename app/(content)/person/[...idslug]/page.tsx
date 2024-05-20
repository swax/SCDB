import getContentFuncs from "@/app/api/content/getContentFuncs";
import s3url from "@/shared/cdnHost";
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { PromiseReturnType } from "@prisma/client/extension";
import Image from "next/image";
import { ContentPageProps, fetchCachedContent } from "../../contentBase";

export default async function PersonaPage({ params }: ContentPageProps) {
  // Data fetching
  type PersonType = PromiseReturnType<typeof getContentFuncs.person>;
  const person = await fetchCachedContent<PersonType>("person", params);

  // Constants
  const imgHeight = 300;
  const imgWidth = imgHeight * (9 / 16);

  const birthDate = person.birth_date ? new Date(person.birth_date) : null;
  const deathDate = person.death_date ? new Date(person.death_date) : null;

  const age = birthDate
    ? (deathDate || new Date()).getFullYear() - birthDate.getFullYear()
    : undefined;

  // Rendering
  return (
    <>
      <Typography variant="h4">{person.name}</Typography>

      {/* birth, death, age */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {!!birthDate && (
          <Typography variant="subtitle1">
            B. {birthDate.toLocaleDateString()}
          </Typography>
        )}
        {!!deathDate && (
          <Typography variant="subtitle1">
            D. {deathDate.toLocaleDateString()}
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
      <Box mt={4}>
        <Typography
          variant="caption"
          sx={{ fontStyle: "italic", color: "grey" }}
        >
          Generated: {new Date(person.dateGenerated).toLocaleString()}
          <br />
          Page Generated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </>
  );
}
