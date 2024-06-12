import MuiNextLink from "@/app/components/MuiNextLink";
import { getSketchList } from "@/backend/content/sketchService";
import { Button } from "@mui/material";
import { ListPageProps, parseSearchParams } from "../baseListTypes";
import SketchDataGrid from "./SketchDataGrid";

export default async function SketchesPage(props: ListPageProps) {
  // URL params
  const searchParams = parseSearchParams(props.searchParams);

  // Data
  const sketches = await getSketchList(searchParams);

  const rows = sketches.list.map((sketch) => ({
    id: sketch.id,
    title: sketch.title,
    show__title: sketch.show.title,
    season__year: sketch.season?.year,
    url_slug: sketch.url_slug,
    site_rating: sketch.site_rating,
  }));

  // Rendering
  return (
    <>
      <title>Sketches - SketchTV.lol</title>
      <SketchDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={sketches.count}
      />
      <MuiNextLink href="/edit/sketch">
        <Button>Add Sketch</Button>
      </MuiNextLink>
    </>
  );
}
