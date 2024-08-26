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
  };
}

/**
 * Way over engineered, but aggregates the sketch description, cast, and title to build the meta description
 * Over engineered because it reduces the strings proportionally to fit a max size when joined together
 */
export function buildSketchMetaDescription({
  description,
  sketch_casts,
  sketch_tags,
}: sketchType): string {
  const metaParts: string[] = [];

  // Start with the description
  if (description) {
    metaParts.push(description);
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
    .join(", ");

  if (starring) {
    metaParts.push("Starring: " + starring);
  }

  // Add the tags
  const tags = sketch_tags.map((sketch_tag) => sketch_tag.tag.name).join(", ");

  if (tags) {
    metaParts.push("Tags: " + tags);
  }

  return reduceStringsToMaxSizeAndJoin(metaParts, 150);
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

/** Reduces an array of strings proportionally to fit a max size when joined together */
function reduceStringsToMaxSizeAndJoin(strings: string[], maxSize: number) {
  // Calculate the total length of all strings in the array
  const totalLength = strings.reduce((acc, str) => acc + str.length, 0);

  // If the total length is already within the maxSize, return the original array
  if (totalLength <= maxSize) {
    return strings.join(". ");
  }

  const numStrings = strings.length;
  const minSizePerString = maxSize / numStrings;

  const freeSpace = strings.reduce((acc, str) => {
    const underflow =
      str.length < minSizePerString ? minSizePerString - str.length : 0;
    return acc + underflow;
  }, 0);

  const spaceRequested = strings.reduce((acc, str) => {
    const overflow =
      str.length > minSizePerString ? str.length - minSizePerString : 0;
    return acc + overflow;
  }, 0);

  // Calculate the reduction ratio
  const reductionRatio = freeSpace / spaceRequested;

  // Apply the reduction to each string in the array
  return strings
    .map((str) => {
      if (str.length <= minSizePerString) {
        return str + ". ";
      } else {
        const extraCharsToKeep =
          (str.length - minSizePerString) * reductionRatio;
        return str.slice(0, minSizePerString + extraCharsToKeep) + "... ";
      }
    })
    .join("");
}
