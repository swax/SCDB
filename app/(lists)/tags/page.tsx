import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getAllTagsList } from "@/backend/content/tagService";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import TagsDataGrid from "./TagsDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Tags"),
  description: "A filterable list of tags",
};

export default async function TagsPage(props: ListPageProps) {
  // URL params
  const searchParams = await parseSearchParams(props.searchParams);

  // Data
  const tags = await getCachedList("tag", getAllTagsList)(searchParams);

  const rows = tags.list.map((tag) => ({
    id: tag.id,
    name: tag.name,
    url_slug: tag.url_slug,
    category__name: tag.category.name,
    category__url_slug: tag.category.url_slug,
    category__id: tag.category.id,
    sketch_tags___count: tag._count.sketch_tags,
  }));

  // Rendering
  return (
    <>
      <TagsDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={tags.count}
      />
      <DateGeneratedFooter genDate={tags.dateGenerated} type="data" />
    </>
  );
}
