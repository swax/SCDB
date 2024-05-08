import { ISketch } from "@/backend/content/sketchService";
import { Typography } from "@mui/material";

interface SketchClientPageProps {
  sketch: ISketch;
}

export function SketchClientPage({ sketch }: SketchClientPageProps) {
  return (
    <>
      <Typography variant="h4">{sketch.title}</Typography>
      <Typography variant="subtitle1">
        {sketch.episode.season.show.title}{" "}
        {sketch.episode && <span>({sketch.episode.season.year})</span>}
      </Typography>
    </>
  );
}
