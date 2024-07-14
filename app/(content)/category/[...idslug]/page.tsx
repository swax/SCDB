/**
 * This page is a cross between a 'tag list' page and a 'category content' page
 * Can't put a revalidate on this page because then search params won't work
 */

import { ContentPageProps, tryGetContent } from "@/app/(content)/contentBase";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import MuiNextLink from "@/app/components/MuiNextLink";
import { getCategory } from "@/backend/content/categoryService";
import { getTagsByCategoryList } from "@/backend/content/tagService";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../../../(lists)/baseListTypes";
import TagsDataGrid from "./TagsDataGrid";

const getRequestCachedCategory = cache(async (id: number) => getCategory(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const category = await getRequestCachedCategory(id);

  return category
    ? {
        title: buildPageTitle(category.name),
        description: `Comedy sketches featuring ${category.name}`,
      }
    : {};
}

/** A combination of a list page and a content page because the url has an id/slug */
export default async function CategoryPage(
  props: ContentPageProps & ListPageProps,
) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Fetch data

  // This is this only tryGetContent that isn't cached at the page level
  const category = await tryGetContent(
    "category",
    props.params,
    getRequestCachedCategory,
  );

  // When any tag is updated, all category tag list pages will be revalidated
  // Not the most 'efficient', but the generic edit pages are set to revalidate tags with table names
  const tags = await getCachedList(`tag`, getTagsByCategoryList)(
    searchParams,
    category.id,
  );

  const rows = tags.list.map((tag) => ({
    id: tag.id,
    name: tag.name,
    url_slug: tag.url_slug,
    sketch_tags___count: tag._count.sketch_tags,
  }));

  // Rendering
  return (
    <>
      <Box style={{ marginTop: 32, marginBottom: 32 }}>
        <Typography component="h1" variant="h4">
          {category.name}
        </Typography>
        <Typography component="div" variant="subtitle1" color="textSecondary">
          <MuiNextLink href={"/categories"} prefetch={false}>
            Category
          </MuiNextLink>
        </Typography>
      </Box>
      <TagsDataGrid
        basePath={`category/${category.id}/${category.url_slug}`}
        searchParams={searchParams}
        rows={rows}
        totalRowCount={tags.count}
      />
      <DateGeneratedFooter genDate={tags.dateGenerated} type="data" />
    </>
  );
}
