"use client";

import { Backdrop } from "@mui/material";
import { useMemo } from "react";

interface VideoPlayerProps {
  videoUrls: string[];
  onClose: () => void;
}

export default function VideoPlayer({ videoUrls, onClose }: VideoPlayerProps) {
  // Hooks
  const [cleanVideoUrl, provider] = useMemo(() => {
    if (!videoUrls || videoUrls.length == 0) {
      return ["", ""] as const;
    }

    const url = videoUrls[0];

    if (url.includes("https://www.youtube.com/embed/")) {
      return [url, "youtube"] as const;
    }

    if (url.includes("https://player.vimeo.com/video/")) {
      return [url, "vimeo"] as const;
    }

    if (url.includes("https://archive.org/embed/")) {
      return [url, "archive"] as const;
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

    // Turn https://archive.org/details/the-state-season-4-mkv/The+State+-+S04E01.mkv into https://archive.org/embed/the-state-season-4-mkv
    if (url.includes("archive.org/details/")) {
      const videoId = url.split("/")[4];
      return [`https://archive.org/embed/${videoId}`, "archive"] as const;
    }

    // Get ID 7371058051584970026 from https://www.tiktok.com/@nypost/video/7371058051584970026 with regex
    if (url.includes("tiktok.com/@")) {
      const videoId = url.match(/\/video\/(\d+)/)?.[1];
      return [`${videoId}`, "tiktok"] as const;
    }

    return ["", ""] as const;
  }, [videoUrls]);

  // Rendering
  return (
    <Backdrop
      onClick={onClose}
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

      {(provider == "youtube" ||
        provider == "vimeo" ||
        provider == "archive") && (
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
  );
}
