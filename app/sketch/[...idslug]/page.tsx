import { getSketch } from "@/backend/content/sketchService";
import { notFound } from "next/navigation";
import { SketchClientPage } from "./page.client";

export default async function SketchPage({
  params,
}: {
  params: { idslug: string[] };
}) {
  const [id, slug] = params.idslug;

  // validate slug and redirect if invalid

  const sketch = await getSketch(parseInt(id));

  if (!sketch) {
    notFound();
  }

  // Rendering
  return <SketchClientPage sketch={sketch} />;
}
