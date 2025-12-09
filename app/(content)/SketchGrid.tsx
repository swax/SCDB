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
  Checkbox,
  FormControlLabel,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Pagination,
  PaginationItem,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  SketchGridData,
  SketchGridSearchOptions,
} from "../../shared/sketchGridBase";
import AccordionHeader from "../components/AccordionHeader";
import { ContentLink } from "../components/ContentLink";
import VideoPlayer from "../components/VideoPlayer";

interface SketchGridProps {
  initialData: SketchGridData;
  getData: (
    page: number,
    options?: SketchGridSearchOptions,
  ) => Promise<SketchGridData>;
  title?: string;
  icon?: React.ReactNode;
  options?: {
    minorRolesFilter?: boolean;
  };
}

export default function SketchGrid({
  initialData,
  getData,
  title,
  icon,
  options,
}: SketchGridProps) {
  // Hooks
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial page from URL or default to 1
  const urlPage = parseInt(searchParams.get("sketchPage") || "1", 10);
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(urlPage);
  const [loading, setLoading] = useState(false);
  const [playVideoUrls, setPlayVideoUrls] = useState<string[] | null>(null);

  const [hideMinorRoles, setHideMinorRoles] = useState(false);

  // Load data when URL page changes
  useEffect(() => {
    const newUrlPage = parseInt(searchParams.get("sketchPage") || "1", 10);
    if (newUrlPage !== page) {
      setPage(newUrlPage);
      void reloadSketchGrid(newUrlPage, hideMinorRoles);
    }
  }, [searchParams]);

  // Event Handlers
  function handleChange_pageination(
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) {
    // Prevent default link navigation (which would scroll to top)
    event.preventDefault();

    // Update URL with new page (scroll: false keeps position)
    const url = buildUrl(newPage);
    router.push(url, { scroll: false });
    // The useEffect will handle reloading the data
  }

  function handleChange_minorRolesFilter(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const newSetting = event.target.checked;
    setHideMinorRoles(newSetting);

    void reloadSketchGrid(page, newSetting);
  }

  // Helper functions
  function buildUrl(pageNum: number): string {
    const params = new URLSearchParams(searchParams.toString());

    if (pageNum === 1) {
      params.delete("sketchPage");
    } else {
      params.set("sketchPage", pageNum.toString());
    }

    const queryString = params.toString();
    return pathname + (queryString ? `?${queryString}` : "");
  }

  async function reloadSketchGrid(page: number, hideMinorRoles: boolean) {
    setLoading(true);

    const options = hideMinorRoles ? { hideMinorRoles: true } : undefined;

    const newData = await getData(page, options);
    setData(newData);

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
                  style={{
                    position: "relative",
                    width: imgWidth,
                    height: imgHeight,
                  }}
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
                        : "/images/sketch-placeholder.png"
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
                    <h3
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
                    </h3>
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
            onChange={handleChange_pageination}
            page={page}
            renderItem={(item) => (
              <PaginationItem
                component={Link}
                href={buildUrl(item.page || 1)}
                {...item}
              />
            )}
          />
        )}
        {options?.minorRolesFilter && (
          <FormControlLabel
            disabled={loading}
            label="Hide Minor Roles (No Lines)"
            control={
              <Checkbox
                checked={hideMinorRoles}
                onChange={handleChange_minorRolesFilter}
              />
            }
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
