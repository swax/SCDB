"use client";

import s3url from "@/shared/cdnHost";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ImageListItem,
  ImageListItemBar,
  Pagination,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { SketchGridData } from "../../shared/sketchGridBase";
import { ContentLink } from "../components/ContentLink";

interface SketchGridProps {
  initialData: SketchGridData;
  getData: (page: number) => Promise<SketchGridData>;
}

export default function SketchGrid({ initialData, getData }: SketchGridProps) {
  // Hooks
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

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
  const imgWidth = 250;
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
        <LiveTvIcon />
        <Typography fontWeight="bold" marginLeft={1}>
          {data.totalCount} Sketches
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div
          className="sketch-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {data.sketches.map((sketch, i) => (
            <ImageListItem key={i}>
              <ContentLink mui table="sketch" entry={sketch}>
                <Image
                  alt={sketch.title?.toLocaleString() || ""}
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
              </ContentLink>
              <ImageListItemBar
                title={
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: "1", overflow: "hidden" }}>
                      {sketch.title}
                    </div>
                    {!!sketch.site_rating && (
                      <div>⭐ {sketch.site_rating.toFixed(0)}</div>
                    )}
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
      </AccordionDetails>
    </Accordion>
  );
}
