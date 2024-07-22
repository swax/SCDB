import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getCharacterList } from "@/backend/content/characterService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import CharacterDataGrid from "./CharacterDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Characters"),
  description: "A filterable list of comedy sketches by character",
};

export default async function CharactersPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const characters = await getCachedList(
    "character",
    getCharacterList,
  )(searchParams);

  const rows = characters.list.map((character) => ({
    id: character.id,
    name: character.name,
    url_slug: character.url_slug,
    sketch_casts___count: character._count.sketch_casts,
  }));

  // Rendering
  return (
    <>
      <CharacterDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={characters.count}
      />
      <DateGeneratedFooter genDate={characters.dateGenerated} type="data" />
    </>
  );
}
