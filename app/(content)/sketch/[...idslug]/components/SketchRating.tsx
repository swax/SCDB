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
  1: "1. Poor: Lacks any coherent humor or appeal, failing completely to engage or amuse the audience.",
  2: "2. Weak: This sketch has few redeeming qualities, with humor that falls flat and performances that don't deliver.",
  3: "3. Below Average: Lacks consistent laughs, with uneven pacing or humor that doesn't quite land.",
  4: "4. Average: An ordinary sketch with some humor, but it struggles to leave a lasting impression.",
  5: "5. Above Average: Decent overall with enough humor to keep it engaging, but not particularly memorable.",
  6: "6. Good: Solidly entertaining with some great moments, though it may lack some flair to make it standout.",
  7: "7. Very Good: This sketch has notable humor and creativity, making it a strong and enjoyable watch.",
  8: "8. Great: Very entertaining with consistent laughs and clever writing that impresses and delights.",
  9: "9. Excellent: Exceptionally funny and well-crafted, this sketch captures perfect comedic timing and strong performances.",
  10: "10. Masterpiece: This sketch is a comedic gem, delivering unparalleled laughter and originality that's unforgettable.",
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
          <Box style={{ height: "40px" }}>{labelValue}</Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
