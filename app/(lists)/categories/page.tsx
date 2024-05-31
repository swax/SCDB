import { getCategoriesList } from "@/backend/content/categoryService";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import CategoriesDataGrid from "./CategoriesDataGrid";

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const categories = await getCategoriesList(searchParams);

  // Rendering
  return (
    <CategoriesDataGrid
      searchParams={searchParams}
      rows={categories.list}
      totalRowCount={categories.count}
    />
  );
}
