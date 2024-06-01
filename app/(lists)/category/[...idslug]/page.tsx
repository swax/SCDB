import { ContentPageProps, tryGetContent } from "@/app/(content)/contentBase";
import { getCategory } from "@/backend/content/categoryService";
import { getTagsByCategoryList } from "@/backend/content/tagService";
import { Box, Typography } from "@mui/material";
import { ListPageProps, parseSearchParams } from "../../baseListTypes";
import TagsDataGrid from "./TagsDataGrid";

/** A combination of a list page and a content page because the url has an id/slug */
export default async function CategoryPage(
  props: ContentPageProps & ListPageProps,
) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Fetch data
  const category = await tryGetContent("category", props.params, getCategory);
  const tags = await getTagsByCategoryList(category.id, searchParams);

  const rows = tags.list.map((tag) => ({
    id: tag.id,
    name: tag.name,
    url_slug: tag.url_slug,
    sketch_tags___count: tag._count.sketch_tags,
  }));

  // Rendering
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4">{category.name}</Typography>
      </Box>
      <TagsDataGrid
        basePath={`category/${category.id}/${category.url_slug}`}
        searchParams={searchParams}
        rows={rows}
        totalRowCount={tags.count}
      />
    </>
  );
}
