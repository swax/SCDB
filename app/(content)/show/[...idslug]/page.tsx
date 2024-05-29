import {
  getShow,
  getShowSketchGrid,
  getShowsList,
} from "@/backend/content/showService";
import { Typography } from "@mui/material";
import SketchGrid from "../../SketchGrid";
import {
  ContentPageProps,
  DateGeneratedFooter,
  tryGetContent,
} from "../../contentBase";

export async function generateStaticParams() {
  const shows = await getShowsList({ page: 1, pageSize: 1000 });

  return shows.list.map((show) => ({
    idslug: [show.id.toString(), show.url_slug],
  }));
}

export default async function ShowPage({ params }: ContentPageProps) {
  // Data fetching
  const show = await tryGetContent("show", params, getShow);

  async function getSketchData(page: number) {
    "use server";
    return await getShowSketchGrid(show.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Typography variant="h4">{show.title}</Typography>
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <DateGeneratedFooter />
    </>
  );
}
