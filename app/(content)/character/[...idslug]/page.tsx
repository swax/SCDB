import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getCharacter,
  getCharacterList,
  getCharacterSketchGrid,
} from "@/backend/content/characterService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedCharacter = cache(async (id: number) => getCharacter(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const character = await getRequestCachedCharacter(id);

  return character
    ? {
        title: buildPageTitle(character.name),
        description: `Comedy sketches featuring the character ${character.name}`,
      }
    : {};
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
    getRequestCachedCharacter,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getCharacterSketchGrid(character.id, page);
  }

  const sketchData = await getSketchData(1);

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

      <SketchGrid initialData={sketchData} getData={getSketchData} />

      <LinksPanel link_urls={character.link_urls} />

      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
