import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getCategoriesList } from "@/backend/content/categoryService";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import CategoriesDataGrid from "./CategoriesDataGrid";
import { buildPageTitle } from "@/shared/utilities";

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const categories = await getCachedList(
    "category",
    getCategoriesList,
  )(searchParams);

  const rows = categories.list.map((category) => ({
    id: category.id,
    name: category.name,
    url_slug: category.url_slug,
    tags___count: category._count.tags,
  }));

  // Rendering
  const pageTitle = buildPageTitle("Categories");

  return (
    <>
      <title>{pageTitle}</title>
      <CategoriesDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={categories.count}
      />
      <DateGeneratedFooter dataDate={categories.dateGenerated} />
    </>
  );
}
