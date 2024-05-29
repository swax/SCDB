import s3url from "@/shared/cdnHost";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export interface SketchPreview {
  id: number;
  url_slug: string;
  title: string;
  subtitle?: string;
  image_cdnkey?: string;
}

interface SketchAccordianProps {
  sketches: SketchPreview[];
}

export default function SketchAccordian({ sketches }: SketchAccordianProps) {
  // Rendering
  const imgWidth = 250;
  const imgHeight = Math.round(imgWidth / 1.75);

  return (
    <>
      {!!sketches?.length && (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="sketches-content"
            id="sketches-header"
          >
            <LiveTvIcon />
            <Typography fontWeight="bold" marginLeft={1}>
              Sketches
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {sketches.map((sketch, i) => (
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
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
