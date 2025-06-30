import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import { getSketch, getSketchList } from "@/backend/content/sketchService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import staticUrl from "@/shared/cdnHost";
import {
  buildPageMeta,
  buildSketchMetaDescription,
} from "@/shared/metaBuilder";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import { cache } from "react";
import { ContentPageProps, tryGetContent } from "../../contentBase";
import SketchPageBody from "./sketchPageBody";
import { castMemberType, combinedCastMemberType } from "./sketchTypes";

// Cached for the life of the request only
const getCachedSketch = cache(async (id: number) => getSketch(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.idslug[0]);

  const sketch = await getCachedSketch(id);
  if (!sketch) {
    return {};
  }

  const title = buildPageTitle(
    `${sketch.title} - ${sketch.show.title} ${sketch.season ? sketch.season.year : ""}`,
  );
  const description = buildSketchMetaDescription(sketch);

  const images = sketch.image
    ? [
        {
          url: `${staticUrl}/${sketch.image.cdn_key}`,
          alt: sketch.title,
        },
      ]
    : [];

  return buildPageMeta(
    title,
    description,
    `/sketch/${sketch.id}/${sketch.url_slug}`,
    images,
  );
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const sketches = await getSketchList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return sketches.list.map((sketch) => ({
    idslug: [sketch.id.toString(), sketch.url_slug],
  }));
}

export default async function SketchPage({ params }: ContentPageProps) {
  // Data fetching
  const sketch = await tryGetContent("sketch", params, getCachedSketch);

  // Combine cast members that are the same person/image - just the characters are different
  // ie in a sketch Taran Killam plays a character that is both Vin Diesel and Thumper, same picture
  const combinedCastMembers: combinedCastMemberType[] = [];

  for (const castMember of sketch.sketch_casts) {
    let combinedCastMember = combinedCastMembers.find(
      (ccm) =>
        castMember.person &&
        ccm.person?.id === castMember.person.id &&
        ccm.image?.cdn_key === castMember.image?.cdn_key,
    );

    if (combinedCastMember) {
      const title = getCastMemberTitle(castMember);
      combinedCastMember.tooltip += " / " + getCastMemberTooltip(castMember);
      combinedCastMember.title = (
        <>
          {combinedCastMember.title}
          {" / "}
          <br />
          {title}
        </>
      );
    } else {
      combinedCastMember = {
        ...castMember,
        tooltip: getCastMemberTooltip(castMember),
        title: getCastMemberTitle(castMember),
      };
      combinedCastMembers.push(combinedCastMember);
    }
  }

  // Helper functions
  function getCastMemberTitle(castMember: castMemberType) {
    return (
      <>
        {castMember.character ? (
          <ContentLink mui table="character" entry={castMember.character} />
        ) : (
          <span>{castMember.character_name || ""}</span>
        )}
      </>
    );
  }

  function getCastMemberTooltip(castMember: castMemberType) {
    return (
      castMember.character_name || castMember.person?.name || castMember.role
    );
  }

  // Rendering
  return (
    <>
      <SketchPageBody
        sketch={sketch}
        combinedCastMembers={combinedCastMembers}
      />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
