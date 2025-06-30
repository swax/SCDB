import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getCategoriesList } from "@/backend/content/categoryService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import CategoriesDataGrid from "./CategoriesDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Categories"),
  description: "A filterable list of comedy sketches by category",
};

export default async function CategoriesPage(props: ListPageProps) {
  // URL params
  const searchParams = await parseSearchParams(props.searchParams);

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
  return (
    <>
      <CategoriesDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={categories.count}
      />
      <DateGeneratedFooter genDate={categories.dateGenerated} type="data" />
    </>
  );
}
