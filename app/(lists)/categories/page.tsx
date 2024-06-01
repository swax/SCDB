import { getCategoriesList } from "@/backend/content/categoryService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import CategoriesDataGrid from "./CategoriesDataGrid";

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const categories = await getCategoriesList(searchParams);

  const rows = categories.list.map((category) => ({
    id: category.id,
    name: category.name,
    url_slug: category.url_slug,
    tags___count: category._count.tags,
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
