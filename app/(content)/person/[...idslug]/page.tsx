import MuiNextLink from "@/app/components/MuiNextLink";
import {
  getPerson,
  getPersonList,
  getPersonSketchGrid,
} from "@/backend/content/personService";
import s3url from "@/shared/cdnHost";
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import Image from "next/image";
import SketchGrid from "../../SketchGrid";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";

export async function generateStaticParams() {
  const poeple = await getPersonList({ page: 1, pageSize: 1000 });

  return poeple.list.map((person) => ({
    idslug: [person.id.toString(), person.url_slug],
  }));
}

export default async function PersonPage({ params }: ContentPageProps) {
  // Data fetching
  const person = await tryGetContent("person", params, getPerson);

  async function getSketchData(page: number) {
    "use server";
    return await getPersonSketchGrid(person.id, page);
  }

  const sketchData = await getSketchData(1);

  // Constants
  const imgHeight = 300;
  const imgWidth = imgHeight * (9 / 16);

  const birthDate = person.birth_date ? new Date(person.birth_date) : null;
  const deathDate = person.death_date ? new Date(person.death_date) : null;

  // Rendering
  return (
    <>
      <Typography variant="h4">{person.name}</Typography>
      {Boolean(person.character) && (
        <Typography variant="subtitle1" mb={4}>
          The Person,{" "}
          <MuiNextLink
            href={`/character/${person.character?.id}/${person.character?.url_slug}`}
          >
            The Character
          </MuiNextLink>
        </Typography>
      )}
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
        {!!person.age && (
          <Typography variant="subtitle1">Age: {person.age}</Typography>
        )}
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
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <DateGeneratedFooter />
    </>
  );
}
