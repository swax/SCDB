import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getPerson,
  getPersonList,
  getPersonSketchCastGrid,
  getPersonSketchCreditGrid,
} from "@/backend/content/personService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import s3url from "@/shared/cdnHost";
import { buildPageTitle } from "@/shared/utilities";
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedPerson = cache(async (id: number) => getPerson(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const person = await getRequestCachedPerson(id);

  return person
    ? {
        title: buildPageTitle(person.name),
        description: `Comedy sketches featuring the person ${person.name}`,
      }
    : {};
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const poeple = await getPersonList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return poeple.list.map((person) => ({
    idslug: [person.id.toString(), person.url_slug],
  }));
}

export default async function PersonPage({ params }: ContentPageProps) {
  // Data fetching
  const person = await tryGetContent("person", params, getRequestCachedPerson);

  async function getSketchCastData(page: number) {
    "use server";
    return await getPersonSketchCastGrid(person.id, page);
  }

  async function getSketchCreditData(page: number) {
    "use server";
    return await getPersonSketchCreditGrid(person.id, page);
  }

  const sketchCastData = await getSketchCastData(1);
  const sketchCreditData = await getSketchCreditData(1);

  // Constants
  const imgHeight = 300;
  const imgWidth = Math.floor(imgHeight * (9 / 16));

  const birthDate = person.birth_date ? new Date(person.birth_date) : null;
  const deathDate = person.death_date ? new Date(person.death_date) : null;

  // Rendering
  return (
    <>
      <Box mt={4} mb={4}>
        <Typography component="h1" variant="h4">
          {person.name}
        </Typography>
        <Typography component="div" variant="subtitle1">
          The Person
        </Typography>
        {!!person.character && (
          <Typography component="div" variant="subtitle2">
            <ContentLink mui table="character" entry={person.character}>
              Go to the Character
            </ContentLink>
          </Typography>
        )}
      </Box>
      {/* birth, death, age */}
      {(!!birthDate || !!deathDate || !!person.age) && (
        <Box sx={{ display: "flex", gap: 2 }}>
          {!!birthDate && (
            <Typography component="div" variant="subtitle1">
              B. {birthDate.toLocaleDateString()}
            </Typography>
          )}
          {!!deathDate && (
            <Typography component="div" variant="subtitle1">
              D. {deathDate.toLocaleDateString()}
            </Typography>
          )}
          {!!person.age && (
            <Typography component="div" variant="subtitle1">
              Age: {person.age}
            </Typography>
          )}
        </Box>
      )}
      {!!person.person_images.length && (
        <ImageList
          aria-label="Person Images"
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            padding: 1,
          }}
          cols={2.5}
        >
          {person.person_images.map((person_image, i) => (
            <ImageListItem key={i} aria-label={`Picture ${i}`}>
              <Image
                alt={person_image.description || person.name}
                style={{ objectFit: "cover", borderRadius: 8 }}
                src={`${s3url}/${person_image.image.cdn_key}`}
                priority={i == 0}
                width={imgWidth}
                height={imgHeight}
              />
              {!!person_image.description && (
                <ImageListItemBar
                  subtitle={person_image.description}
                  sx={{ width: imgWidth }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}
      <DescriptionPanel description={person.description} title="About" />
      <SketchGrid initialData={sketchCastData} getData={getSketchCastData} />
      <SketchGrid
        initialData={sketchCreditData}
        getData={getSketchCreditData}
        title="Credits"
      />
      <LinksPanel link_urls={person.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
