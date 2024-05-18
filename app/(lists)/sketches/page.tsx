import { getSketchList } from "@/backend/content/sketchService";
import SketchListClientPage from "./page.client";

export default async function SketchListPage({
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
    <SketchListClientPage
      page={page - 1}
      pageSize={pageSize}
      rowCount={sketches.count}
      rows={rows}
    />
  );
}
