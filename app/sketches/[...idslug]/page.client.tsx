import { ISketch } from "@/backend/sketchService";
import { Typography } from "@mui/material";

interface SketchClientPageProps {
  sketch: ISketch;
}

export function SketchClientPage({ sketch }: SketchClientPageProps) {
  return (
    <>
      <Typography variant="h4">{sketch.title}</Typography>
      <Typography variant="subtitle1">
        {sketch.show.name}{" "}
        {sketch.episode && <span>({sketch.episode.season.year})</span>}
      </Typography>
    </>
  );
}
