import DateGeneratedFooter from "@/app/components/DateGeneratedFooter";
import {
  getLatestSketchGrid,
  getTrendingSketchGrid,
} from "@/backend/content/homeService";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Paper, Typography } from "@mui/material";
import SketchGrid from "./(content)/SketchGrid";
import MuiNextLink from "./components/MuiNextLink";

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
  return (
    <>
      {/* Beta announcement */}
      <Box
        sx={{
          marginTop: 2,
          padding: 0.5,
          textAlign: "center",
        }}
      >
        {/* H1 is important for SEO */}
        <Typography component="h1" variant="subtitle1">
          SketchTV.lol - The Sketch Comedy Database
        </Typography>
      </Box>
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
          component="div"
          variant="subtitle1"
          color="textSecondary"
          textAlign={"center"}
        >
          SketchTV.lol is a free database of sketch comedy. More info{" "}
          <MuiNextLink href="/about">here</MuiNextLink>.<br />
          Help us grow by creating an account and adding your favorite sketches!
        </Typography>
      </Box>
      <DateGeneratedFooter genDate={new Date()} type="page" />
    </>
  );
}
