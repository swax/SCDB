import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldCms, ImageFieldCms } from "@/backend/cms/cmsTypes";
import staticUrl from "@/shared/cdnHost";
import { getImageDimensions } from "@/shared/imgSizing";
import { fileToShortHash, showAndLogError } from "@/shared/utilities";
import { Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getPresignedUploadUrl } from "../../actions/uploadAction";

interface ImageFieldProps {
  field: ImageFieldCms;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (
    field: FieldCms,
    index: number,
    value: Nullable<string>,
  ) => void;
  tableName: string;
}

export default function ImageField({
  field,
  index,
  loading,
  setFieldValue,
  tableName,
}: ImageFieldProps) {
  // Hooks
  const forceUpdate = useForceUpdate();
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Event Handlers
  function handleChange_field(value: Nullable<string>) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  async function uploadFile(file: File) {
    setUploading(true);

    try {
      const shortHash = await fileToShortHash(file);

      // Get presigned URL so client can upload directly to S3
      const reponse = await getPresignedUploadUrl(
        "images",
        tableName,
        file.name,
        shortHash,
        file.type,
        file.size,
      );

      if (reponse.error || !reponse.content) {
        showAndLogError(reponse.error || "Unknown error");
        return;
      }

      const presignedPost = reponse.content;

      // Upload
      const formData = new FormData();

      Object.entries({
        ...presignedPost.fields,
        file,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Upload to S3
      const uploadResponse = await fetch(presignedPost.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        alert(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
        return;
      }

      // Update field value
      handleChange_field(presignedPost.fields.key);
    } finally {
      setUploading(false);
    }
  }

  async function handleChange_uploadImage(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    for (const file of Array.from(e.target.files || [])) {
      await uploadFile(file);
      // Only support uploading a single file right now
      break;
    }
  }

  async function handlePaste(e: ClipboardEvent) {
    // Check if there are any image files in the clipboard
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        await uploadFile(file);
      }
    }
  }

  // Setup paste event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("paste", handlePaste);
    return () => container.removeEventListener("paste", handlePaste);
  }, [tableName, index, field, loading, uploading]);

  // Rendering
  const cdnKey = field.values?.[index] || "";
  const imgUrl = `${staticUrl}/${cdnKey}`;
  const showRequiredHighlight = !field.optional && !cdnKey;

  return (
    <Stack
      ref={containerRef}
      direction="column"
      spacing={1}
      tabIndex={0}
      sx={{
        outline: "none",
        "&:focus-within": {
          opacity: 0.9,
        },
      }}
    >
      <Typography component="h2" variant="body1">
        {field.label}{" "}
        <Typography component="span" variant="caption" color="text.secondary">
          (click to focus, then paste)
        </Typography>
      </Typography>
      <Stack direction="row" spacing={2}>
        {/* Preview how the image will look in the video and cast sections */}
        {cdnKey &&
          field.preview.map((previewAspectRatio, i) => {
            const { width, height, objectPosition } = getImageDimensions(
              previewAspectRatio,
              150,
            );

            return (
              <div key={i} style={{ position: "relative" }}>
                <Image
                  alt={previewAspectRatio + " Preview Image"}
                  title={previewAspectRatio + " Preview Image"}
                  style={{
                    display: "block",
                    objectFit: "cover",
                    objectPosition,
                    borderRadius: 8,
                  }}
                  src={imgUrl}
                  width={width}
                  height={height}
                />
                {previewAspectRatio == "square" && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: height / 3,
                      background: "#0008",
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    (Character)
                    <br />
                    (Actor)
                  </div>
                )}
              </div>
            );
          })}
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button
          component={"label" /* Must be a label for upload link to work*/}
          disabled={loading || uploading}
          color={showRequiredHighlight ? "error" : "primary"}
          style={{
            border: showRequiredHighlight
              ? "1px solid #f44336"
              : "1px solid lightblue",
          }}
          variant="text"
        >
          {uploading ? "Uploading..." : cdnKey ? "Change" : "Upload"}
          <input
            accept="image/*"
            hidden
            multiple
            onChange={(e) => void handleChange_uploadImage(e)}
            type="file"
          />
        </Button>
        {cdnKey && (
          <Button
            onClick={() => handleChange_field(null)}
            disabled={loading || uploading}
            variant="outlined"
          >
            Delete
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
