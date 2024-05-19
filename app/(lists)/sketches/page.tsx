import { getSketchList } from "@/backend/content/sketchService";
import SketchDataGrid from "./SketchDataGrid";
import { Button, Link } from "@mui/material";

export default async function SketchesPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}) {
  // URL params
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "30");

  // Data
  const sketches = await getSketchList(page, pageSize);

  const rows = sketches.list.map((sketch) => ({
    id: sketch.id,
    title: sketch.title,
    show: sketch.show.title,
    year: sketch.season?.year,
    url_slug: sketch.url_slug,
  }));

  // Rendering
  return (
    <>
      <SketchDataGrid
        page={page - 1}
        pageSize={pageSize}
        rowCount={sketches.count}
        rows={rows}
      />
      <Link component={Button} href="/edit/sketch">
        Add Sketch
      </Link>
    </>
  );
}
