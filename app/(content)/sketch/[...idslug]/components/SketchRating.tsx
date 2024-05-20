"use client";

import StarIcon from "@mui/icons-material/Star";
import { Box, Rating } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getRating, saveRating } from "../actions/ratingActions";

const labels: { [index: string]: string } = {
  1: "The worst",
  2: "Bad",
  3: "Poor",
  4: "Subpar",
  5: "Meh",
  6: "Ok",
  7: "Good: Would rewatch",
  8: "Great",
  9: "Excellent",
  10: "Outstanding",
};

function getLabelText(value: number) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

interface SketchRatingProps {
  sketchId: number;
}

export default function SketchRating({ sketchId }: SketchRatingProps) {
  // Hooks
  const [canEdit, setCanEdit] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [hover, setHover] = useState(-1);
  const session = useSession();

  useEffect(() => {
    const getUserRating = async () => {
      const initialUserRating = await getRating(sketchId);
      setValue(initialUserRating);
      setCanEdit(true);
    };

    if (session.status == "authenticated" && !canEdit) {
      void getUserRating();
    }
  }, [session.status]);

  // Events
  async function rating_handleChange(newValue: number | null) {
    const oldValue = value;

    setCanEdit(false);
    setValue(newValue); // Optimistic update

    const response = await saveRating(sketchId, newValue);

    setCanEdit(true);

    if (response.error) {
      alert(response.error);
      setValue(oldValue);
    }
  }

  // Rendering
  const labelIndex = hover !== -1 ? hover : value;
  const labelValue = labelIndex != null ? labels[labelIndex] : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Rating
        name="hover-feedback"
        disabled={!canEdit}
        value={value}
        getLabelText={getLabelText}
        defaultValue={0}
        max={10}
        onChange={(event, newValue) => void rating_handleChange(newValue)}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      {!!labelValue && <Box sx={{ ml: 2 }}>{labelValue}</Box>}
    </Box>
  );
}
