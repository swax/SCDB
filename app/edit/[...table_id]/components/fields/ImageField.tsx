import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldCms, ImageFieldCms } from "@/backend/cms/cmsTypes";
import staticUrl from "@/shared/cdnHost";
import { getImageDimensions } from "@/shared/imgSizing";
import { fileToShortHash, showAndLogError } from "@/shared/utilities";
import { Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
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

  // Event Handlers
  function handleChange_field(value: Nullable<string>) {
    setFieldValue(field, index, value);

    forceUpdate();
  }

  async function handleChange_uploadImage(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    setUploading(true);

    for (const file of Array.from(e.target.files || [])) {
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
        setUploading(false);
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
        setUploading(false);
        return;
      }

      // Update field value
      handleChange_field(presignedPost.fields.key);

      // Only support uploading a single file right now
      break;
    }

    setUploading(false);
  }

  // Rendering
  const cdnKey = field.values?.[index] || "";
  const imgUrl = `${staticUrl}/${cdnKey}`;
  const showRequiredHighlight = !field.optional && !cdnKey;

  return (
    <Stack direction="column" spacing={1}>
      <Typography component="h2" variant="body1">
        {field.label}
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
