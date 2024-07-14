"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Box, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import MuiNextLink from "./MuiNextLink";

interface VideoPlayerProps {
  videoUrls: string[];
  onClose: () => void;
}

export default function VideoPlayer({ videoUrls, onClose }: VideoPlayerProps) {
  // Hooks
  const [selectedUrl, setSelectedUrl] = useState(videoUrls[0]);
  const [videoUrl, setVideoUrl] = useState("");
  const [provider, setProvider] = useState("");
  let { height, width } = useWindowSize();

  useEffect(() => {
    const url = selectedUrl;

    setVideoUrl(url);
    setProvider("");

    // Embedded youtube url
    if (url.startsWith("https://www.youtube.com/embed/")) {
      setProvider("youtube");
    }
    // Embedded video url
    else if (url.startsWith("https://player.vimeo.com/video/")) {
      setProvider("vimeo");
    }
    // Embedded web archive url
    else if (url.startsWith("https://archive.org/embed/")) {
      setProvider("archive");
    }

    // Turn https://www.youtube.com/watch?v=5fvsItXYgzk into https://www.youtube.com/embed/5fvsItXYgzk
    else if (url.startsWith("https://www.youtube.com/watch?v=")) {
      const videoId = url.split("v=").pop();
      setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      setProvider("youtube");
    }

    // Turn https://vimeo.com/386154032 into https://player.vimeo.com/video/386154032
    else if (url.startsWith("https://vimeo.com/")) {
      const videoId = url.split("/").pop();
      setVideoUrl(`https://player.vimeo.com/video/${videoId}`);
      setProvider("vimeo");
    }

    // Turn https://archive.org/details/the-state-season-4-mkv/The+State+-+S04E01.mkv into https://archive.org/embed/the-state-season-4-mkv
    else if (url.startsWith("https://archive.org/details/")) {
      const videoId = url.split("/")[4];
      setVideoUrl(`https://archive.org/embed/${videoId}`);
      setProvider("archive");
    }

    // Get ID 7371058051584970026 from https://www.tiktok.com/@nypost/video/7371058051584970026 with regex
    else if (url.startsWith("https://www.tiktok.com/@")) {
      const videoId = url.match(/\/video\/(\d+)/)?.[1] || "";
      setVideoUrl(videoId);
      setProvider("tiktok");
    }

    // https://www.reddit.com/r/Terminator/comments/m41ve3/the_tooncinator/
    else if (url.startsWith("https://www.reddit.com/")) {
      setProvider("reddit");
    }

    // https://www.facebook.com/watch/?v=470851350261614
    else if (url.startsWith("https://www.facebook.com/")) {
      setProvider("facebook");
    }
  }, [selectedUrl]);

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
              <Box marginTop={2}>
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
