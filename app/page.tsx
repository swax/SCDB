import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import {
  getLatestSketchGrid,
  getTrendingSketchGrid,
  getUpcomingBirthdays,
} from "@/backend/content/homeService";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Typography } from "@mui/material";
import { Suspense } from "react";
import SketchGrid from "./(content)/SketchGrid";
import FeaturedTagChips from "./components/FeaturedTagChips";
import MuiNextLink from "./components/MuiNextLink";
import Snow from "./components/Snow";
import UpcomingBirthdays from "./components/UpcomingBirthdays";

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
  const upcomingBirthdays = await getUpcomingBirthdays();

  // Rendering
  return (
    <>
      <Snow />
      <Box style={{ position: "relative", zIndex: 1 }}>
        {/* Beta announcement */}
        <Box
          style={{
            marginTop: 16,
            padding: 4,
            textAlign: "center",
          }}
        >
          {/* H1 is important for SEO */}
          <Typography component="h1" variant="subtitle1" style={{fontWeight: 'bold'}}>
            {(() => {
              const text = "SketchTV.lol - The Sketch Comedy Database";
              const parts = text.split(/(\s+|\.|-|!)/);
              let wordIndex = 0;
              return parts.map((part, i) => {
                let color = "#ffffff";
                if (part === "." || part === "-" || part === "!") {
                  color = "#ffffff";
                } else if (part.trim()) {
                  color = wordIndex % 2 === 0 ? "#c41e3a" : "#0f8644";
                  wordIndex++;
                }
                return (
                  <span key={i} style={{ color }}>
                    {part}
                  </span>
                );
              });
            })()}
          </Typography>
          <FeaturedTagChips />
        </Box>
        <Box style={{ marginTop: 16 }}>
          <Suspense fallback={<div>Loading...</div>}>
            <SketchGrid
              initialData={latestSketchData}
              getData={getLatestSketchData}
              title="Latest Sketches"
            />
            <UpcomingBirthdays birthdays={upcomingBirthdays} />
            <SketchGrid
              initialData={trendingSketchData}
              getData={getTrendingSketchData}
              title="Trending Sketches"
              icon={<TrendingUpIcon />}
            />
          </Suspense>
        </Box>
        <Box style={{ marginTop: 48 }} className="about-page">
          <Typography
            component="div"
            variant="subtitle1"
            color="textSecondary"
            textAlign={"center"}
          >
            SketchTV.lol is a free database of sketch comedy. More info{" "}
            <MuiNextLink href="/about">here</MuiNextLink>.<br />
            Help us grow by creating an account and adding your favorite
            sketches!
          </Typography>
        </Box>
        <DateGeneratedFooter genDate={new Date()} type="page" />
      </Box>
    </>
  );
}
