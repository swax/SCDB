"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Box, Chip, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useWindowSize } from "react-use";
import MuiNextLink from "./MuiNextLink";

interface VideoPlayerProps {
  videoUrls: string[];
  onClose: () => void;
}

function deriveVideoInfo(url: string): { videoUrl: string; provider: string } {
  if (url.startsWith("https://www.youtube.com/embed/")) {
    return { videoUrl: url, provider: "youtube" };
  }
  if (url.startsWith("https://player.vimeo.com/video/")) {
    return { videoUrl: url, provider: "vimeo" };
  }
  if (url.startsWith("https://archive.org/embed/")) {
    return { videoUrl: url, provider: "archive" };
  }
  if (url.startsWith("https://www.youtube.com/watch?v=")) {
    const videoId = url.split("v=").pop();
    return {
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      provider: "youtube",
    };
  }
  if (url.startsWith("https://vimeo.com/")) {
    const videoId = url.split("/").pop();
    return {
      videoUrl: `https://player.vimeo.com/video/${videoId}`,
      provider: "vimeo",
    };
  }
  if (url.startsWith("https://archive.org/details/")) {
    const videoId = url.split("/")[4];
    return {
      videoUrl: `https://archive.org/embed/${videoId}`,
      provider: "archive",
    };
  }
  if (url.startsWith("https://www.tiktok.com/@")) {
    const videoId = url.match(/\/video\/(\d+)/)?.[1] || "";
    return { videoUrl: videoId, provider: "tiktok" };
  }
  if (url.startsWith("https://www.reddit.com/")) {
    return { videoUrl: url, provider: "reddit" };
  }
  if (url.startsWith("https://www.facebook.com/")) {
    return { videoUrl: url, provider: "facebook" };
  }
  return { videoUrl: url, provider: "" };
}

export default function VideoPlayer({ videoUrls, onClose }: VideoPlayerProps) {
  // Hooks
  const [selectedUrl, setSelectedUrl] = useState(videoUrls[0]);
  const { videoUrl, provider } = useMemo(
    () => deriveVideoInfo(selectedUrl),
    [selectedUrl],
  );
  let { height, width } = useWindowSize();

  // Rendering
  if (typeof window !== "undefined") {
    width = Math.round(Math.min(window.innerWidth * 0.95, 800));
    height = Math.round(Math.min(window.innerHeight * 0.75, 600));
  }

  return (
    <Backdrop
      aria-hidden={false}
      onClick={onClose}
      open={true}
      sx={{
        backgroundColor: "#000d",
        color: "white",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Box
        aria-label="Video Player Overlay"
        id="video-player-overlay"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        style={{
          background: "black",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box style={{ flex: 1, margin: "auto" }}>
          {provider == "reddit" && (
            <div>
              {/* The div above prevents an error with unmounting this block */}
              <blockquote
                className="reddit-embed-bq"
                style={{ height, background: "black" }}
                data-embed-theme="dark"
                data-embed-showedits="false"
                data-embed-height={height}
              >
                <a href={videoUrl}>Link to video on Reddit</a>
              </blockquote>
              <script async src="https://embed.reddit.com/widgets.js"></script>
            </div>
          )}

          {provider == "facebook" && (
            <iframe
              src={`https://www.facebook.com/plugins/video.php?height=${height}&href=${videoUrl}&show_text=false&width=${width}&t=0`}
              width={width}
              height={height}
              style={{ border: "none", overflow: "hidden" }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen={true}
            ></iframe>
          )}

          {provider == "tiktok" && (
            <div>
              {/* The div above prevents an error with unmounting this block */}
              <blockquote
                className="tiktok-embed"
                data-video-id={videoUrl}
                style={{
                  maxWidth: width,
                  minWidth: height,
                  background: "black",
                }}
              >
                <section style={{ background: "black" }}></section>
              </blockquote>
              <script async src="https://www.tiktok.com/embed.js"></script>
            </div>
          )}

          {(provider == "youtube" ||
            provider == "vimeo" ||
            provider == "archive") && (
            <iframe
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              src={videoUrl}
              style={{ border: "1px solid #222", background: "black" }}
              width={width}
              height={height}
            ></iframe>
          )}

          {provider == "vimeo" && (
            <script src="https://player.vimeo.com/api/player.js" async></script>
          )}

          {!provider && (
            <Box
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                marginTop: 2,
              }}
            >
              <Typography variant="h6">
                Video provider not found for url
              </Typography>
              <Typography variant="body1">
                Click this link to go there directly
              </Typography>
              <Box style={{ marginTop: "16px" }}>
                <MuiNextLink href={videoUrl} target="_blank">
                  {videoUrl}
                </MuiNextLink>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom bar with video links */}
        {videoUrls.length > 1 && (
          <Box style={{ display: "flex" }}>
            <Box style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
              {videoUrls.map((url, index) => (
                <Chip
                  clickable={url == selectedUrl ? false : true}
                  key={index}
                  label={new URL(url).hostname}
                  onClick={() => setSelectedUrl(url)}
                  style={{ margin: "5px" }}
                  variant={url == selectedUrl ? "filled" : "outlined"}
                />
              ))}
            </Box>
            <Chip
              clickable
              icon={<CloseIcon />}
              label="Close"
              onClick={onClose}
              style={{ margin: "5px" }}
              variant="outlined"
            />
          </Box>
        )}
      </Box>
    </Backdrop>
  );
}
