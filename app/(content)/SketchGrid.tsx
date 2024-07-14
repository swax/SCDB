"use client";

import staticUrl from "@/shared/cdnHost";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import PlayCircleFilledTwoToneIcon from "@mui/icons-material/PlayCircleFilledTwoTone";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Pagination,
} from "@mui/material";
import Image from "next/image";
import { useId, useState } from "react";
import { SketchGridData } from "../../shared/sketchGridBase";
import AccordionHeader from "../components/AccordionHeader";
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
  const id = useId();
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
        aria-controls={`sketches-content-${id}`}
        id={`sketches-header-${id}`}
      >
        <AccordionHeader icon={icon || <LiveTvIcon />}>
          {data.totalCount >= 0 ? data.totalCount.toString() : ""}{" "}
          {title || "Sketches"}
        </AccordionHeader>
      </AccordionSummary>
      <AccordionDetails>
        <ImageList
          aria-label={title || "Sketches"}
          className="sketch-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            margin: 0,
          }}
        >
          {data.sketches.map((sketch, i) => (
            <ImageListItem key={i} aria-label={sketch.titleString}>
              <ContentLink mui table="sketch" entry={sketch}>
                <Box
                  style={{ position: "relative" }}
                  width={imgWidth}
                  height={imgHeight}
                >
                  <ButtonBase
                    aria-controls="video-player-overlay"
                    aria-haspopup="true"
                    aria-label="Play Video"
                    style={{
                      position: "absolute",
                      right: "2px",
                      bottom: "2px",
                    }}
                  >
                    <PlayCircleFilledTwoToneIcon
                      fontSize="large"
                      // Capute prevents pageLoadingHook from triggering
                      onClickCapture={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPlayVideoUrls(sketch.video_urls);
                      }}
                    />
                  </ButtonBase>
                  {!!sketch.site_rating && (
                    <Box
                      style={{
                        position: "absolute",
                        left: "2px",
                        top: "2px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        borderRadius: 8,
                        padding: "2px 4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {sketch.site_rating.toFixed(0)} ⭐
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
                        ? `${staticUrl}/${sketch.image_cdnkey}`
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
                    <Box
                      component="h3"
                      style={{
                        flex: "1",
                        fontSize: "16px",
                        fontWeight: 400,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={sketch.titleString}
                    >
                      {sketch.title}
                    </Box>
                  </div>
                }
                subtitle={
                  <h4 style={{ margin: 0, fontWeight: 400 }}>
                    {sketch.subtitle}
                  </h4>
                }
                style={{
                  width: imgWidth,
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
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
