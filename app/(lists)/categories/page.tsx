import { getCategoriesList } from "@/backend/content/categoryService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import CategoriesDataGrid from "./CategoriesDataGrid";

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const categories = await getCategoriesList(searchParams);

  const rows = categories.list.map((character) => ({
    id: character.id,
    name: character.name,
    url_slug: character.url_slug,
  }));

  // Rendering
  return (
    <CategoriesDataGrid
      searchParams={searchParams}
      rows={rows}
      totalRowCount={categories.count}
    />
  );
}
