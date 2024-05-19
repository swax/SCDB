"use client";

import StarIcon from "@mui/icons-material/Star";
import { Box, Rating } from "@mui/material";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { saveRating } from "../actions/saveAction";

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
  const [value, setValue] = useState<number | null>(null);
  const [hover, setHover] = useState(-1);
  const [saving, setSaving] = useState(false);
  const session = useSession();

  const userId = session.data?.user.id;

  // Events
  async function rating_handleChange(newValue: number | null) {
    setSaving(true);

    const response = await saveRating(sketchId, newValue);

    setSaving(false);

    if (response.error) {
      alert(response.error);
    }

    setValue(newValue);
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
        disabled={saving || !userId}
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
