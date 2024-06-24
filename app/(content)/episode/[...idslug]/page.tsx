import { ContentLink } from "@/app/components/ContentLink";
import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import LinksPanel from "@/app/components/LinksPanel";
import {
  getEpisode,
  getEpisodeSketchGrid,
  getEpisodesList,
} from "@/backend/content/episodeService";
import { getStaticPageCount } from "@/shared/ProcessEnv";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { Metadata } from "next";
import { cache } from "react";
import SketchGrid from "../../SketchGrid";
import { ContentPageProps, tryGetContent } from "../../contentBase";

const getRequestCachedEpisode = cache(async (id: number) => getEpisode(id));

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const id = parseInt(params.idslug[0]);

  const episode = await getRequestCachedEpisode(id);

  return episode
    ? {
        title: buildPageTitle(
          `Episode ${episode.number} - ${episode.season.lookup_slug}`,
        ),
        description:
          `Comedy sketches from episode ${episode.number} of ${episode.season.lookup_slug}` +
          (episode.air_date
            ? ` aired on ${episode.air_date.toLocaleDateString()}`
            : ""),
      }
    : {};
}

export const revalidate = 300; // 5 minutes

export async function generateStaticParams() {
  const episodes = await getEpisodesList({
    page: 1,
    pageSize: getStaticPageCount(),
  });

  return episodes.list.map((episode) => ({
    idslug: [episode.id.toString(), episode.url_slug],
  }));
}

export default async function EpisodePage({ params }: ContentPageProps) {
  // Data fetching
  const episode = await tryGetContent(
    "episode",
    params,
    getRequestCachedEpisode,
  );

  async function getSketchData(page: number) {
    "use server";
    return await getEpisodeSketchGrid(episode.id, page);
  }

  const sketchData = await getSketchData(1);

  // Rendering
  return (
    <>
      <Box mt={4} mb={4}>
        <Typography component="h1" variant="h4">
          Episode {episode.number}
        </Typography>
        <Typography component="div" variant="subtitle1">
          <ContentLink mui table="show" entry={episode.season.show} /> -{" "}
          <ContentLink mui table="season" entry={episode.season}>
            Season {episode.season.number}
          </ContentLink>
        </Typography>
        <Typography component="div" variant="subtitle1">
          {episode.air_date?.toLocaleDateString()}
        </Typography>
      </Box>
      <SketchGrid initialData={sketchData} getData={getSketchData} />
      <LinksPanel link_urls={episode.link_urls} />
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
