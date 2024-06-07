"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import s3url from "@/shared/cdnHost";
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone";
import { Box } from "@mui/material";
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
  const imgHeight = imgWidth * (9 / 16);

  return (
    <>
      {image_cdn_key ? (
        <Box
          onClick={() => setPlayVideoUrls(videoUrls)}
          style={{
            cursor: videoUrls ? "pointer" : "default",
            overflow: "hidden",
            width: imgWidth,
            height: imgHeight,
            position: "relative",
          }}
        >
          {!!videoUrls && (
            <PlayCircleFilledTwoToneIcon
              sx={{
                position: "absolute",
                color: "white",
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
            width={imgWidth}
            height={imgHeight}
          />
        </Box>
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
