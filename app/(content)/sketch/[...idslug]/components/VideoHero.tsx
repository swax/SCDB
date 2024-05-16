"use client";

import s3url from "@/shared/cdnHost";
import { Backdrop, Box } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface VideoHeroProps {
  title: string;
  previewImgCdnKey?: string;
  videoEmbedUrl?: string;
}

export default function VideoHero({
  title,
  previewImgCdnKey,
  videoEmbedUrl,
}: VideoHeroProps) {
  // Hooks
  const [playerOpen, setPlayerOpen] = useState(false);

  // Event handlers
  function handleOpenPlayer() {
    if (!videoEmbedUrl) {
      alert("No video URL found");
      return;
    }
    setPlayerOpen(true);
  }

  function handleClosePlayer() {
    setPlayerOpen(false);
  }

  // Rendering
  const imgWidth = 350;
  const imgHeight = imgWidth * (9 / 16);

  return (
    <>
      {previewImgCdnKey ? (
        <Box
          onClick={handleOpenPlayer}
          style={{
            borderRadius: 8,
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
            width: imgWidth,
            height: imgHeight,
          }}
        >
          <Image
            alt={title}
            fill
            objectFit="cover"
            src={`${s3url}/${previewImgCdnKey}`}
          />
        </Box>
      ) : (
        <Box>(No Preview Image)</Box>
      )}
      {playerOpen && videoEmbedUrl && (
        <Backdrop
          onClick={handleClosePlayer}
          open={true}
          sx={{
            backgroundColor: "#000d",
            color: "white",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <iframe
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            src={videoEmbedUrl}
            title="YouTube video player"
            width="800"
            height="600"
          ></iframe>
        </Backdrop>
      )}
    </>
  );
}
