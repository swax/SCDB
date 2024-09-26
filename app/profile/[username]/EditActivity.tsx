import AccordionHeader from "@/app/components/AccordionHeader";
import { ActivityGridRow } from "@/backend/user/profileService";
import { shiftDayToSundayBefore, toLocalDay } from "@/shared/dateService";
import AppsIcon from "@mui/icons-material/Apps";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";
import { getActivityGridAction } from "./actions/getActions";

// heatmap style imported into global.css

type HeatmapValue = {
  /* In 'YYYY-MM-DD' format */
  date: string;
  sketch_ids: number[];
  count: number;
};

export default function EditActivity({ userId }: { userId: string }) {
  const daysBack = 90;

  // Hooks
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activityGrid, setActivityGrid] = useState<ActivityGridRow[]>();

  useEffect(() => {
    if (expanded && !loading && !activityGrid) {
      setLoading(true);
      // Add some buffer to days back because some back days are added to the heat map to show the full week
      void getActivityGridAction(userId, daysBack + 10).then(
        (changeLogResponse) => {
          setActivityGrid(changeLogResponse);
          setLoading(false);
        },
      );
    }
  }, [expanded]);

  const heatmapData = useMemo(() => {
    if (!activityGrid) {
      return [];
    }

    const groupedByDate = activityGrid.reduce<{
      [date: string]: HeatmapValue;
    }>((grouped, activity) => {
      const date = toLocalDay(activity.changed_day);

      if (!grouped[date]) {
        grouped[date] = {
          date,
          sketch_ids: [],
          count: 0,
        };
      }

      grouped[date].sketch_ids.push(activity.sketch_id);
      grouped[date].count += 1;

      return grouped;
    }, {});

    return Object.values(groupedByDate);
  }, [activityGrid]);

  // Helpers
  const getClassForValue = (value?: ReactCalendarHeatmapValue<string>) => {
    if (!value) {
      return "color-empty";
    }
    if (value.count >= 4) return "color-github-4";
    if (value.count === 3) return "color-github-3";
    if (value.count === 2) return "color-github-2";
    if (value.count === 1) return "color-github-1";
    return "color-empty";
  };

  // Rendering
  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="edit-activity-content"
        id="edit-activity-header"
      >
        <AccordionHeader icon={<AppsIcon />}>Sketches Added</AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <Box>Loading...</Box>
        ) : activityGrid ? (
          <CalendarHeatmap
            startDate={shiftDayToSundayBefore(new Date(), -daysBack)}
            endDate={toLocalDay(new Date())}
            gutterSize={2}
            values={heatmapData}
            titleForValue={(value) =>
              value ? `${value.date}: ${value.count} Sketches Added` : ""
            }
            classForValue={getClassForValue}
          />
        ) : (
          <Box>No data</Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
