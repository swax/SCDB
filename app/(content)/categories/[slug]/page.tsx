/**
 * This page is a cross between a 'tag list' page and a 'category content' page
 * Can't put a revalidate on this page because then search params won't work
 */

import { SlugPageProps, tryGetContentBySlug } from "@/app/contentBase";
import MuiNextLink from "@/app/components/MuiNextLink";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getCategoryBySlug } from "@/backend/content/categoryService";
import { getTagsByCategoryList } from "@/backend/content/tagService";
import { buildPageMeta } from "@/shared/metaBuilder";
import { getContentPath } from "@/shared/tableNames";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "@/app/(content)/baseListTypes";
import TagsDataGrid from "./TagsDataGrid";

// Cached for the life of the request only
const getCachedCategory = cache(async (slug: string) =>
  getCategoryBySlug(slug),
);

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const category = await getCachedCategory(slug);
  if (!category) {
    return {};
  }

  const title = buildPageTitle(category.name);
  const description = `Comedy sketches featuring ${category.name}`;

  return buildPageMeta(
    title,
    description,
    getContentPath("category", category.url_slug),
    [],
  );
}

/** A combination of a list page and a content page because the url has a slug */
export default async function CategoryPage(
  props: SlugPageProps & ListPageProps,
) {
  // URL params
  const searchParams = await parseSearchParams(props.searchParams);

  // Fetch data
  const category = await tryGetContentBySlug(props.params, getCachedCategory);

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
        basePath={`categories/${category.url_slug}`}
        searchParams={searchParams}
        rows={rows}
        totalRowCount={tags.count}
      />
      <DateGeneratedFooter genDate={tags.dateGenerated} type="data" />
    </>
  );
}
