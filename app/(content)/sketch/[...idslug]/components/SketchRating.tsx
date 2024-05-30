"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Rating,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getRating, saveRating } from "../actions/ratingActions";

const labels: { [index: string]: string } = {
  1: "1. The worst",
  2: "2. Bad",
  3: "3. Poor",
  4: "4. Subpar",
  5: "5. Meh",
  6: "6. Ok",
  7: "7. Good: Would rewatch",
  8: "8. Great",
  9: "9. Excellent",
  10: "10. Outstanding. A Classic!",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

interface SketchRatingProps {
  sketchId: number;
  siteRating: number | null;
}

export default function SketchRating({
  sketchId,
  siteRating: initialSiteRating,
}: SketchRatingProps) {
  // Hooks
  const [canEdit, setCanEdit] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [siteRating, setSiteRating] = useState(initialSiteRating);
  const [hover, setHover] = useState(-1);
  const session = useSession();

  useEffect(() => {
    const getUserRating = async () => {
      const initialRating = await getRating(sketchId);
      setUserRating(initialRating.content?.userRating || null);
      setCanEdit(true);
    };

    if (session.status == "authenticated" && !canEdit) {
      void getUserRating();
    }
  }, [session.status]);

  // Events
  async function rating_handleChange(newValue: number | null) {
    const oldValue = userRating;

    setCanEdit(false);
    setUserRating(newValue); // Optimistic update

    const response = await saveRating(sketchId, newValue);

    setCanEdit(true);

    if (response.error || !response.content) {
      alert(response.error);
      setUserRating(oldValue);
      return;
    }

    setUserRating(response.content.userRating);
    setSiteRating(response.content.siteRating);
  }

  // Rendering
  const labelIndex = hover !== -1 ? hover : userRating;
  const labelValue = labelIndex != null ? labels[labelIndex] : null;

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="cast-content"
        id="cast-header"
      >
        <Typography marginLeft={1}>Site Rating:</Typography>
        <StarIcon sx={{ color: "gold" }} />
        <Typography fontWeight="bold">
          {siteRating ? siteRating.toFixed(1) : "-"}
        </Typography>
        <Typography marginLeft={2}>Your Rating:</Typography>
        <StarIcon sx={{ color: "dodgerblue" }} />
        <Typography fontWeight="bold">{userRating || "-"}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: 1,
          }}
        >
          <Rating
            name="hover-feedback"
            disabled={!canEdit}
            icon={<StarIcon sx={{ color: "dodgerblue" }} fontSize="inherit" />}
            value={userRating}
            getLabelText={getLabelText}
            defaultValue={0}
            max={10}
            onChange={(event, newValue) => void rating_handleChange(newValue)}
            onChangeActive={(event, newHover) => {
              setHover(newHover);
            }}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
            }
          />
          {!!labelValue && <Box sx={{ ml: 2 }}>{labelValue}</Box>}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
