import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import {
  getLatestSketchGrid,
  getTrendingSketchGrid,
} from "@/backend/content/homeService";
import { buildPageTitle } from "@/shared/utilities";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Typography } from "@mui/material";
import SketchGrid from "./(content)/SketchGrid";

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  // Data fetching
  async function getLatestSketchData(page: number) {
    "use server";
    return await getLatestSketchGrid(page);
  }

  async function getTrendingSketchData(page: number) {
    "use server";
    return await getTrendingSketchGrid(page);
  }

  const latestSketchData = await getLatestSketchData(1);
  const trendingSketchData = await getTrendingSketchData(1);

  // Rendering
  const pageTitle = buildPageTitle();

  return (
    <>
      <title>{pageTitle}</title>
      <Box mt={2}>
        <SketchGrid
          initialData={trendingSketchData}
          getData={getTrendingSketchData}
          title="Trending Sketches"
          icon={<TrendingUpIcon />}
        />
        <SketchGrid
          initialData={latestSketchData}
          getData={getLatestSketchData}
          title="Latest Sketches"
        />
      </Box>
      <Box mt={6} className="about-page">
        <Typography
          variant="subtitle1"
          color="textSecondary"
          textAlign={"center"}
        >
          SketchTV.lol is a free database of sketch comedy. More info{" "}
          <a href="/about">here</a>.<br />
          Help us grow by creating an account and adding your favorite sketches!
        </Typography>
      </Box>
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
