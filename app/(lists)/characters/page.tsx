import { getCharacterList } from "@/backend/content/characterService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import CharacterDataGrid from "./CharacterDataGrid";

export default async function CharactersPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const characters = await getCharacterList(searchParams);

  const rows = characters.list.map((character) => ({
    id: character.id,
    name: character.name,
    url_slug: character.url_slug,
    sketch_casts___count: character._count.sketch_casts,
  }));

  // Rendering
  return (
    <>
      <title>Characters - SketchTV.lol</title>
      <CharacterDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={characters.count}
      />
    </>
  );
}
