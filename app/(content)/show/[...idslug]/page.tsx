import {
  getShow,
  getShowSketches,
  getShowsList,
} from "@/backend/content/showService";
import { Typography } from "@mui/material";
import { ContentPageProps, getCachedContent } from "../../contentBase";
import SketchAccordian, { SketchPreview } from "../../SketchAccordian";

export async function generateStaticParams() {
  const shows = await getShowsList({ page: 1, pageSize: 1000 });

  return shows.list.map((show) => ({
    idslug: [show.id.toString(), show.url_slug],
  }));
}

export default async function ShowPage({ params }: ContentPageProps) {
  // Data fetching
  const show = await getCachedContent("show", params, getShow);
  const sketchData = await getShowSketches(show.id, 0, 9);

  const sketches: SketchPreview[] = sketchData.list.map((s) => ({
    id: s.id,
    url_slug: s.url_slug,
    title: s.title,
    subtitle: s.season?.year.toString(),
    image_cdnkey: s.image?.cdn_key,
  }));

  // Rendering
  return (
    <>
      <Typography variant="h4">{show.title}</Typography>
      <SketchAccordian sketches={sketches} />
    </>
  );
}
