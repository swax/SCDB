import DateGeneratedFooter from "@/app/footer/DateGeneratedFooter";
import MuiNextLink from "@/app/components/MuiNextLink";
import { getSketchList } from "@/backend/content/sketchService";
import { buildPageTitle } from "@/shared/utilities";
import { Button } from "@mui/material";
import { Metadata } from "next";
import {
  ListPageProps,
  getCachedList,
  parseSearchParams,
} from "../baseListTypes";
import SketchDataGrid from "./SketchDataGrid";

export const metadata: Metadata = {
  title: buildPageTitle("Sketches"),
  description: "A filterable list of comedy sketches",
};

export default async function SketchesPage(props: ListPageProps) {
  // URL params
  const searchParams = await parseSearchParams(props.searchParams);

  // Data
  const sketches = await getCachedList("sketch", getSketchList)(searchParams);

  const rows = sketches.list.map((sketch) => ({
    id: sketch.id,
    title: sketch.title,
    show__title: sketch.show.title,
    season__year: sketch.season?.year,
    url_slug: sketch.url_slug,
    site_rating: sketch.site_rating,
    posted_on_socials: sketch.posted_on_socials,
  }));

  // Rendering
  return (
    <>
      <SketchDataGrid
        searchParams={searchParams}
        rows={rows}
        totalRowCount={sketches.count}
      />
      <MuiNextLink href="/edit/sketch" prefetch={false}>
        <Button>Add Sketch</Button>
      </MuiNextLink>
      <DateGeneratedFooter genDate={sketches.dateGenerated} type="data" />
    </>
  );
}
