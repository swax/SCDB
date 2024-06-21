import { getSketch } from "@/backend/content/sketchService";

export type sketchType = Exclude<Awaited<ReturnType<typeof getSketch>>, null>;

export type castMemberType = sketchType["sketch_casts"][number];

export type combinedCastMemberType = castMemberType & {
  title: JSX.Element;
  tooltip: string;
};
