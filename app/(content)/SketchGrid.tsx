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
import Link from "next/link";
import { useState } from "react";
import { SketchGridData } from "../../shared/sketchGridBase";

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
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {data.sketches.map((sketch, i) => (
            <ImageListItem
              key={i}
              component={Link}
              href={`/sketch/${sketch.id}/${sketch.url_slug}`}
            >
              <Image
                alt={sketch.title}
                style={{ objectFit: "cover", borderRadius: 8 }}
                src={
                  sketch.image_cdnkey
                    ? `${s3url}/${sketch.image_cdnkey}`
                    : "/images/no-image.webp"
                }
                width={imgWidth}
                height={imgHeight}
              />
              <ImageListItemBar
                title={sketch.title}
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
