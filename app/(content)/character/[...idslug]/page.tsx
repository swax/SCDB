import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getCharacter,
  getCharacterList,
  getCharacterSketchGrid,
} from "@/backend/content/characterService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import {
  buildPageMeta,
  getMetaImagesForSketchGrid,
} from "@/shared/metaBuilder";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache, Suspense } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

// Cached for the life of the request only
const getCachedCharacter = cache(async (id: number) => getCharacter(id));
const getCachedCharacterSketchGrid = cache(async (id: number) =>
  getCharacterSketchGrid(id, 1),
);

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.idslug[0]);

  const character = await getCachedCharacter(id);
  if (!character) {
    return {};
  }

  const sketches = await getCachedCharacterSketchGrid(id);

  return buildPageMeta(
    buildPageTitle(character.name),
    `Comedy sketches featuring the character ${character.name}`,
    `/character/${character.id}/${character.url_slug}`,
    getMetaImagesForSketchGrid(sketches, 3),
  );
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const characters = await getCharacterList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return characters.list.map((character) => ({
    idslug: [character.id.toString(), character.url_slug],
  }));
}

export default async function CharacterPage({ params }: ContentPageProps) {
  const character = await tryGetContent(
    "character",
    params,
    getCachedCharacter,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getCharacterSketchGrid(character.id, page);
  }

  const sketchData = await getCachedCharacterSketchGrid(character.id);

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {character.name}
        </Typography>
        <Typography component="div" variant="subtitle1">
          The Character
        </Typography>
        {!!character.person && (
          <Typography component="div" variant="subtitle2">
            <ContentLink mui table="person" entry={character.person}>
              Go to the Person
            </ContentLink>
          </Typography>
        )}
      </Box>

      <DescriptionPanel description={character.description} title="About" />

      <Suspense fallback={<div>Loading sketches...</div>}>
        <SketchGrid initialData={sketchData} getData={getSketchData} />
      </Suspense>

      <LinksPanel link_urls={character.link_urls} />

      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
