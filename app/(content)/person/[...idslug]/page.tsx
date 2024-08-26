import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getPerson,
  getPersonList,
  getPersonSketchCastGrid,
  getPersonSketchCreditGrid,
} from "@/backend/content/personService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import staticUrl from "@/shared/cdnHost";
import { buildPageMeta } from "@/shared/metaBuilder";
import { buildPageTitle, toNiceDate } from "@/shared/utilities";
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

// Cached for the life of the request only
const getCachedPerson = cache(async (id: number) => getPerson(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const person = await getCachedPerson(id);
  if (!person) {
    return {};
  }

  const title = buildPageTitle(person.name);
  const description = `Comedy sketches featuring ${person.name}`;

  return buildPageMeta(
    title,
    description,
    `/person/${person.id}/${person.url_slug}`,
    person.person_images.map((person_image) => ({
      url: `${staticUrl}/${person_image.image.cdn_key}`,
      alt: `Image of ${person.name}`,
    })),
  );
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
  const person = await tryGetContent("person", params, getCachedPerson);

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
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
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
        <Box style={{ display: "flex", gap: 2 }}>
          {!!birthDate && (
            <Typography component="div" variant="subtitle1">
              Born: {toNiceDate(birthDate)}
            </Typography>
          )}
          {!!deathDate && (
            <Typography component="div" variant="subtitle1">
              Died: {toNiceDate(deathDate)}
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
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            padding: 8,
          }}
          cols={2.5}
        >
          {person.person_images.map((person_image, i) => (
            <ImageListItem key={i} aria-label={`Picture ${i}`}>
              <Image
                alt={`Image ${i}: ${person_image.description || person.name}`}
                style={{ objectFit: "cover", borderRadius: 8 }}
                src={`${staticUrl}/${person_image.image.cdn_key}`}
                priority={i == 0}
                width={imgWidth}
                height={imgHeight}
              />
              {!!person_image.description && (
                <ImageListItemBar
                  subtitle={person_image.description}
                  style={{ width: imgWidth }}
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
