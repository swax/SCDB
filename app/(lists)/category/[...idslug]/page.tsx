import { ContentPageProps, tryGetContent } from "@/app/(content)/contentBase";
import { getCategory } from "@/backend/content/categoryService";
import { getTagsList } from "@/backend/content/tagService";
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
  const tags = await getTagsList(category.id, searchParams);

  // Rendering
  return (
    <>
      <Box mb={4}>
        <Typography variant="h4">{category.name}</Typography>
      </Box>
      <TagsDataGrid
        basePath={`category/${category.id}/${category.url_slug}`}
        searchParams={searchParams}
        rows={tags.list}
        totalRowCount={tags.count}
      />
    </>
  );
}
