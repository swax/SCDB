import { getSketchList } from "@/backend/content/sketchService";
import { Button, Link } from "@mui/material";
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
  }));

  // Rendering
  return (
    <>
      <SketchDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={sketches.count}
      />
      <Link component={Button} href="/edit/sketch">
        Add Sketch
      </Link>
    </>
  );
}
