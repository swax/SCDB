import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
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
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

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
  const character = await tryGetContent("character", params, getCharacter);

  async function getSketchData(page: number) {
    "use server";
    return await getCharacterSketchGrid(character.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  const pageTitle = buildPageTitle(character.name);

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={4} mb={4}>
        <Typography variant="h4">{character.name}</Typography>
        <Typography variant="subtitle1">The Character</Typography>
        {!!character.person && (
          <Typography variant="subtitle2">
            <ContentLink mui table="person" entry={character.person}>
              Go to the Person
            </ContentLink>
          </Typography>
        )}
      </Box>

      <DescriptionPanel description={character.description} title="About" />

      <SketchGrid initialData={sketchData} getData={getSketchData} />

      <LinksPanel link_urls={character.link_urls} />

      <DateGeneratedFooter />
    </>
  );
}
