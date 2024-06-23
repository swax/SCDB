"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import s3url from "@/shared/cdnHost";
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone";
import { Box, ButtonBase } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface VideoHeroProps {
  title: string;
  image_cdn_key?: string;
  videoUrls?: string[];
}

export default function VideoHero({
  title,
  image_cdn_key,
  videoUrls,
}: VideoHeroProps) {
  // Hooks
  const [playVideoUrls, setPlayVideoUrls] = useState<string[] | undefined>();

  // Rendering
  const imgWidth = 350;
  const imgHeight = Math.floor(imgWidth * (9 / 16));

  return (
    <>
      {image_cdn_key ? (
        <ButtonBase
          aria-controls="video-player-overlay"
          aria-haspopup="true"
          aria-label="Play Video"
          onClick={() => setPlayVideoUrls(videoUrls)}
          style={{
            overflow: "hidden",
            width: imgWidth,
            height: imgHeight,
            position: "relative",
          }}
        >
          {!!videoUrls && (
            <PlayCircleFilledTwoToneIcon
              sx={{
                color: "white",
                position: "absolute",
                right: "2px",
                bottom: "2px",
              }}
              fontSize="large"
            />
          )}
          <Image
            alt={title}
            src={`${s3url}/${image_cdn_key}`}
            style={{ objectFit: "cover", borderRadius: 8 }}
            priority
            width={imgWidth}
            height={imgHeight}
          />
        </ButtonBase>
      ) : (
        <Box>(No Preview Image)</Box>
      )}
      {!!playVideoUrls && (
        <VideoPlayer
          videoUrls={playVideoUrls}
          onClose={() => setPlayVideoUrls(undefined)}
        />
      )}
    </>
  );
}
