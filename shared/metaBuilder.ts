import { Metadata } from "next";
import "server-only";
import { sketchType } from "../app/(content)/sketch/[...idslug]/sketchTypes";
import staticUrl from "./cdnHost";
import { SketchGridData } from "./sketchGridBase";

export function buildPageMeta(
  title: string,
  description: string,
  url: string,
  images: { url: string; alt: string }[],
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      url,
      siteName: "SketchTV.lol",
      images,
    },
    twitter: {
      site: "@sketchtvlol",
      title,
      description,
      card: "summary_large_image",
      images,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID!,
    },
  };
}

/**
 * Way over engineered, but aggregates the sketch synopsis, cast, and title to build the meta description
 * Over engineered because it reduces the strings proportionally to fit a max size when joined together
 */
export function buildSketchMetaDescription({
  synopsis,
  sketch_casts,
  sketch_tags,
}: sketchType): string {
  const metaParts: string[] = [];

  // Start with the synopsis
  if (synopsis) {
    metaParts.push(cleanBreak(synopsis, 50));
  }

  // Add the cast members and characters
  const starring = sketch_casts
    .map((castMember) => {
      const starParts: string[] = [];

      if (castMember.person) {
        starParts.push(castMember.person.name);
      }

      if (castMember.character_name) {
        starParts.push(castMember.character_name);
      }

      return starParts.join(" as ");
    })
    .slice(0, 3)
    .join(", ");

  if (starring) {
    metaParts.push("Starring: " + cleanBreak(starring, 50));
  }

  // Add the tags
  const tags = sketch_tags.map((sketch_tag) => sketch_tag.tag.name).join(", ");

  if (tags) {
    metaParts.push("Tags: " + cleanBreak(tags, 50));
  }

  // Max total around 150 chars
  return metaParts.join(". ");
}

function cleanBreak(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.substring(0, lastSpace) + "...";
}

export function getMetaImagesForSketchGrid(
  sketchGrid: SketchGridData,
  count: number,
) {
  return sketchGrid.sketches
    .map((sketch) => ({
      url: `${staticUrl}/${sketch.image_cdnkey}`,
      alt: sketch.titleString,
    }))
    .slice(0, count);
}
