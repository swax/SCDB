import { useForceUpdate } from "@/app/hooks/useForceUpdate";
import { FieldCms, ImageFieldCms } from "@/backend/cms/cmsTypes";
import s3url from "@/shared/cdnHost";
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
  const imgUrl = `${s3url}/${cdnKey}`;
  const showRequiredHighlight = !field.optional && !cdnKey;

  return (
    <>
      <Typography component="h2" variant="h6">
        {field.label}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {cdnKey && (
          <a href={imgUrl} rel="noreferrer" target="_blank">
            <Image
              alt="The Associated Image"
              height={75}
              src={imgUrl}
              style={{ objectFit: "cover" }}
              unoptimized={true /* Not optimized in edit mode */}
              width={75}
            />
          </a>
        )}
        <Button
          component={"label" /* Must be a label for upload link to work*/}
          disabled={loading || uploading}
          color={showRequiredHighlight ? "error" : "primary"}
          sx={{
            border: showRequiredHighlight
              ? "1px solid #f44336"
              : "1px solid lightblue",
          }}
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
          >
            Delete
          </Button>
        )}
      </Stack>
    </>
  );
}
