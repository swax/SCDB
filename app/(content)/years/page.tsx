import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import MuiNextLink from "@/app/components/MuiNextLink";
import {
  getDistinctYears,
  getYearList,
} from "@/backend/content/sketchService";
import { buildPageTitle } from "@/shared/utilities";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import YearsDataGrid from "./YearsDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Years"),
  description: "Browse comedy sketches by year",
};

export default async function YearsPage(props: ListPageProps) {
  const searchParams = await parseSearchParams(props.searchParams);

  const [decades, yearsData] = await Promise.all([
    getDistinctYears(),
    getCachedList("year", getYearList)(searchParams),
  ]);

  const uniqueDecades = [
    ...new Set(decades.map((y) => Math.floor(y / 10) * 10)),
  ].sort((a, b) => b - a);

  return (
    <>
      <Box style={{ marginTop: 24 }}>
        <Typography component="h1" variant="h5">
          Decades
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          style={{ marginTop: 8 }}
        >
          {uniqueDecades.map((decade) => (
            <MuiNextLink
              key={decade}
              href={`/years/${decade}s`}
              underline="none"
            >
              <Chip clickable label={`${decade}s`} variant="filled" />
            </MuiNextLink>
          ))}
        </Stack>
      </Box>
      <Box style={{ marginTop: 24 }}>
      <YearsDataGrid
        searchParams={searchParams}
        rows={yearsData.list}
        totalRowCount={yearsData.count}
      />
      </Box>
      <DateGeneratedFooter genDate={yearsData.dateGenerated} type="data" />
    </>
  );
}
