import AccordionHeader from "@/app/components/AccordionHeader";
import { GetProfileResponse } from "@/backend/user/profileService";
import AppsIcon from "@mui/icons-material/Apps";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useMemo } from "react";
import CalendarHeatmap, {
  ReactCalendarHeatmapValue,
} from "react-calendar-heatmap";

// heatmap style imported into global.css

type HeatmapValue = {
  /* In 'YYYY-MM-DD' format */
  date: string;
  sketch_ids: number[];
  count: number;
};

export default function EditActivity({
  profile,
}: {
  profile: GetProfileResponse;
}) {
  // Hooks
  const heatmapData = useMemo(() => {
    const groupedByDate = profile.activityGrid.reduce<{
      [date: string]: HeatmapValue;
    }>((grouped, activity) => {
      const date = activity.changed_day.toISOString().split("T")[0];

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
  }, [profile.activityGrid]);

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

  function shiftDate(date: Date, numDays: number) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  }

  // Rendering
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="edit-activity-content"
        id="edit-activity-header"
      >
        <AccordionHeader icon={<AppsIcon />}>
          Sketch Edit Activity
        </AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        <CalendarHeatmap
          startDate={shiftDate(new Date(), -90)}
          endDate={new Date()}
          gutterSize={2}
          values={heatmapData}
          titleForValue={(value) =>
            value ? `${value.date}: ${value.count} Changes` : ""
          }
          classForValue={getClassForValue}
        />
      </AccordionDetails>
    </Accordion>
  );
}
