"use client";

import s3url from "@/shared/cdnHost";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ImageListItem,
  ImageListItemBar,
  Pagination,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { SketchGridData } from "../../shared/sketchGridBase";
import { ContentLink } from "../components/ContentLink";
import VideoPlayer from "../components/VideoPlayer";

interface SketchGridProps {
  initialData: SketchGridData;
  getData: (page: number) => Promise<SketchGridData>;
  title?: string;
  icon?: React.ReactNode;
}

export default function SketchGrid({
  initialData,
  getData,
  title,
  icon,
}: SketchGridProps) {
  // Hooks
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [playVideoUrls, setPlayVideoUrls] = useState<string[] | null>(null);

  // Event Handlers
  async function pageination_handleChange(
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) {
    setLoading(true);

    const newData = await getData(newPage);
    setData(newData);
    setPage(newPage);

    setLoading(false);
  }

  // Rendering
  const imgWidth = 265;
  const imgHeight = Math.round(imgWidth / 1.75);

  if (!initialData.sketches?.length) {
    return <></>;
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="sketches-content"
        id="sketches-header"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon || <LiveTvIcon />}
          <Typography fontWeight="bold" marginLeft={1} variant="h6">
            {data.totalCount >= 0 ? data.totalCount.toString() : ""}{" "}
            {title || "Sketches"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className="sketch-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {data.sketches.map((sketch, i) => (
            <ImageListItem key={i}>
              <ContentLink mui table="sketch" entry={sketch}>
                <Box
                  sx={{ position: "relative" }}
                  width={imgWidth}
                  height={imgHeight}
                >
                  <PlayCircleFilledTwoToneIcon
                    sx={{
                      position: "absolute",
                      right: "2px",
                      bottom: "2px",
                    }}
                    fontSize="large"
                    // Capute prevents pageLoadingHook from triggering
                    onClickCapture={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPlayVideoUrls(sketch.video_urls);
                    }}
                  />
                  {!!sketch.site_rating && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: "2px",
                        top: "2px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: 2,
                        padding: "2px 4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      ⭐ {sketch.site_rating.toFixed(0)}
                    </Box>
                  )}
                  <Image
                    alt={sketch.titleString}
                    title={sketch.titleString}
                    style={{
                      objectFit: "cover",
                      objectPosition: "50% 0",
                      borderRadius: 8,
                    }}
                    src={
                      sketch.image_cdnkey
                        ? `${s3url}/${sketch.image_cdnkey}`
                        : "/images/no-image.webp"
                    }
                    width={imgWidth}
                    height={imgHeight}
                  />
                </Box>
              </ContentLink>
              <ImageListItemBar
                position="below"
                title={
                  <div style={{ display: "flex", width: imgWidth }}>
                    <div
                      style={{
                        flex: "1",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span title={sketch.titleString}>{sketch.title}</span>
                    </div>
                  </div>
                }
                subtitle={sketch.subtitle}
              />
            </ImageListItem>
          ))}
        </div>
        {data.totalPages > 1 && (
          <Pagination
            count={data.totalPages}
            disabled={loading}
            onChange={(e, v) => void pageination_handleChange(e, v)}
            page={page}
          />
        )}
        {!!playVideoUrls && (
          <VideoPlayer
            videoUrls={playVideoUrls}
            onClose={() => setPlayVideoUrls(null)}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
}
