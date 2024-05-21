import { getCharacterList } from "@/backend/content/characterService";
import CharacterDataGrid from "./CharacterDataGrid";

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}) {
  // URL params
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "30");

  // Data
  const characters = await getCharacterList(page, pageSize);

  const rows = characters.list.map((character) => ({
    id: character.id,
    name: character.name,
    url_slug: character.url_slug,
  }));

  // Rendering
  return (
    <CharacterDataGrid
      page={page - 1}
      pageSize={pageSize}
      rowCount={characters.count}
      rows={rows}
    />
  );
}
