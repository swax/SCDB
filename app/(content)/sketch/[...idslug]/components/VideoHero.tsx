"use client";

import s3url from "@/shared/cdnHost";
import { Backdrop, Box } from "@mui/material";
import Image from "next/image";
import { useMemo, useState } from "react";

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

  const [cleanVideoUrl, provider] = useMemo(() => {
    // scrub query params from url
    if (!videoEmbedUrl) {
      return ["", ""] as const;
    }

    const url = videoEmbedUrl;

    if (url.includes("https://www.youtube.com/embed/")) {
      return [url, "youtube"] as const;
    }

    if (url.includes("https://player.vimeo.com/video/")) {
      return [url, "vimeo"] as const;
    }

    // Turn https://www.youtube.com/watch?v=abc123 into https://www.youtube.com/embed/abc123
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=").pop();
      return [`https://www.youtube.com/embed/${videoId}`, "youtube"] as const;
    }

    // Turn https://vimeo.com/386154032 into https://player.vimeo.com/video/386154032
    if (url.includes("https://vimeo.com/")) {
      const videoId = url.split("/").pop();
      return [`https://player.vimeo.com/video/${videoId}`, "vimeo"] as const;
    }

    // Get ID 7371058051584970026 from https://www.tiktok.com/@nypost/video/7371058051584970026 with regex
    if (url.includes("tiktok.com/@")) {
      const videoId = url.match(/\/video\/(\d+)/)?.[1];
      return [`${videoId}`, "tiktok"] as const;
    }

    return ["", ""] as const;
  }, [videoEmbedUrl]);

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
            cursor: "pointer",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Image
            alt={title}
            src={`${s3url}/${previewImgCdnKey}`}
            style={{ objectFit: "cover", borderRadius: 8 }}
            width={imgWidth}
            height={imgHeight}
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
          {provider == "tiktok" && (
            <>
              <blockquote
                className="tiktok-embed"
                data-video-id={cleanVideoUrl}
                style={{
                  maxWidth: "605px",
                  minWidth: "325px",
                  background: "black",
                }}
              >
                <section style={{ background: "black" }}></section>
              </blockquote>
              <script async src="https://www.tiktok.com/embed.js"></script>
            </>
          )}

          {(provider == "youtube" || provider == "vimeo") && (
            <iframe
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              src={cleanVideoUrl}
              style={{ border: "1px solid #222", background: "black" }}
              width="800"
              height="600"
            ></iframe>
          )}

          {provider == "vimeo" && (
            <script src="https://player.vimeo.com/api/player.js" async></script>
          )}
        </Backdrop>
      )}
    </>
  );
}
