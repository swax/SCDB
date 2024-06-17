import { ContentLink } from "@/app/components/ContentLink";
import DescriptionPanel from "@/app/components/DescriptionPanel";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getTag,
  getTagSketchGrid,
  getTagsList,
} from "@/backend/content/tagService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import { Box, Typography } from "@mui/material";
import SketchGrid from "../../SketchGrid";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const tag = await getTagsList({ page: 1, pageSize: getStaticPageCount() });

  return tag.list.map((tag) => ({
    idslug: [tag.id.toString(), tag.url_slug],
  }));
}

export default async function TagPage({ params }: ContentPageProps) {
  const tag = await tryGetContent("tag", params, getTag);

  async function getSketchData(page: number) {
    "use server";
    return await getTagSketchGrid(tag.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  const pageTitle = tag.name + " - SketchTV.lol";

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={4} mb={4}>
        <Typography variant="h4">{tag.name}</Typography>
        <Typography variant="subtitle1">
          <ContentLink mui table="category" entry={tag.category} />
        </Typography>
      </Box>
      <DescriptionPanel description={tag.description} />
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <LinksPanel link_urls={tag.link_urls} />
      <DateGeneratedFooter />
    </>
  );
}
