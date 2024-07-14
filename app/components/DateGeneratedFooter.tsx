"use client";

import { capitalizeFirstLetter } from "@/shared/utilities";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import RevalidateCacheLink from "../header/RevalidateCacheLink";

/**
 * Diagnostic information at the bottom of the page that can be seen by clicking, but
 * we don't want to show it by default so it isn't indexed or shown in search results.
 */
export default function DateGeneratedFooter({
  genDate,
  type,
}: {
  genDate: Date;
  type: "page" | "data";
}) {
  // Hooks
  const [display, setDisplay] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    // Rendering
    const description = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");

    setMetaDescription(description || "Not set");
  }, []);

  // Rendering
  const dateStr = new Date(genDate).toLocaleString();

  return (
    <>
      {/* Click above line to hide info */}
      <Box
        onClick={() => setDisplay(false)}
        style={{
          height: "24px",
          marginTop: 48,
        }}
      ></Box>

      {/* Click below line to show info */}
      <Box
        onClick={() => setDisplay(true)}
        style={{
          borderTop: "1px solid #222",
          height: "24px",
          margin: "auto",
          width: "10%",
        }}
      ></Box>

      {/* The info */}
      {display && (
        <Box
          style={{ fontStyle: "italic", color: "gray", textAlign: "center" }}
        >
          <Typography component="div" variant="caption">
            Meta: {metaDescription}
            <br />
            {`${capitalizeFirstLetter(type)} Generated: ${dateStr}`}
            <br />
            <RevalidateCacheLink />
          </Typography>
        </Box>
      )}
    </>
  );
}
