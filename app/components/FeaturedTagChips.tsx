"use client";

import { Box, Chip } from "@mui/material";
import { useEffect, useState } from "react";

const featuredTags = [
  {
    label: "Winter",
    href: "/tag/1453/holidays-winter",
    color: "#e3f2fd",
  },
  { label: "Christmas", href: "/tag/42/holidays-Christmas", color: "#ff5252" },
  { label: "Friendship", href: "/tag/225/friendship", color: "#ffd54f" },
  {
    label: "Santa Claus",
    href: "/tag/1395/characters-santa-claus",
    color: "#ff5252",
  },
  {
    label: "Hanukkah",
    href: "/tag/1385/holidays-hanukkah",
    color: "#64b5f6",
  },
  { label: "Family", href: "/tag/422/family", color: "#81c784" },
  {
    label: "Gift Giving",
    href: "/tag/1027/topics-gift-giving",
    color: "#ffd54f",
  },
];

export default function FeaturedTagChips() {
  const [blinkingChips, setBlinkingChips] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly select 2-4 chips to blink
      const numberOfChipsToBlink = Math.floor(Math.random() * 3) + 2;
      const newBlinkingChips = new Set<number>();

      while (newBlinkingChips.size < numberOfChipsToBlink) {
        const randomIndex = Math.floor(Math.random() * featuredTags.length);
        newBlinkingChips.add(randomIndex);
      }

      setBlinkingChips(newBlinkingChips);
    }, 800); // Change which chips are bright every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: 12,
      }}
    >
      {featuredTags.map((tag, index) => {
        const isBright = blinkingChips.has(index);
        return (
          <Chip
            key={tag.href}
            label={tag.label}
            component="a"
            href={tag.href}
            clickable
            variant="outlined"
            sx={{
              borderColor: tag.color,
              color: tag.color,
              boxShadow: isBright
                ? `0 0 12px ${tag.color}, 0 0 20px ${tag.color}`
                : "none",
              transition: "box-shadow 0.3s ease-in-out",
            }}
          />
        );
      })}
    </Box>
  );
}
