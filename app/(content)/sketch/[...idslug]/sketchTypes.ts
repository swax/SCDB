import { getSketch } from "@/backend/content/sketchService";
import React from "react";

export type sketchType = Exclude<Awaited<ReturnType<typeof getSketch>>, null>;

export type castMemberType = sketchType["sketch_casts"][number];

export type combinedCastMemberType = castMemberType & {
  title: React.JSX.Element;
  tooltip: string;
};
