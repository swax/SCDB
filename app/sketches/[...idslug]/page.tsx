import { getSketch } from "@/backend/sketchService";
import { notFound } from "next/navigation";

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
  return <>Hello {sketch.title}</>;
}
