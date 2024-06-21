import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import { getSketch, getSketchList } from "@/backend/content/sketchService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import { buildPageTitle } from "@/shared/utilities";
import { Metadata } from "next";
import { cache } from "react";
import { ContentPageProps, tryGetContent } from "../../contentBase";
import SketchPageBody from "./sketchPageBody";
import { buildSketchMetaDescription } from "./sketchPageMeta";
import { castMemberType, combinedCastMemberType } from "./sketchTypes";

const getRequestCachedSketch = cache(async (id: number) => getSketch(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const sketch = await getRequestCachedSketch(id);

  return sketch
    ? {
        title: buildPageTitle(
          `${sketch.title} - ${sketch.show.title} ${sketch.season ? sketch.season.year : ""}`,
        ),
        description: buildSketchMetaDescription(sketch),
      }
    : {};
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
  const sketch = await tryGetContent("sketch", params, getRequestCachedSketch);

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
      combinedCastMember.tooltip += " / " + (castMember.character_name || "");
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
        tooltip: castMember.character_name || "",
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
