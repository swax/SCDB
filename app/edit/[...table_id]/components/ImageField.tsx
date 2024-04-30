import { FieldOrm, ImageFieldOrm } from "@/database/orm/ormTypes";
import { useForceUpdate } from "@/frontend/hooks/useForceUpdate";
import s3url from "@/shared/cdnHost";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { getPresignedUploadUrl } from "../actions/uploadAction";

interface ImageFieldProps {
  field: ImageFieldOrm;
  index: number;
  inTable: boolean;
  loading: boolean;
  setFieldValue: (
    field: FieldOrm,
    index: number,
    value: Nullable<string>,
  ) => void;
  tableName: string;
}

export default function ImageField({
  field,
  index,
  inTable,
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

    try {
      for (const file of Array.from(e.target.files || [])) {
        // Get presigned URL so client can upload directly to S3
        const presignedPost = await getPresignedUploadUrl(
          "images",
          tableName,
          file.name,
          file.type,
          file.size,
        );

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
          throw `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`;
        }

        // Update field value
        handleChange_field(presignedPost.fields.key);

        // Only support uploading a single file right now
        break;
      }
    } catch (error) {
      alert(`Error uploading image: ${error}`);
    }

    setUploading(false);
  }

  // Rendering
  const cdnKey = field.values?.[index] || "";
  const imgUrl = `${s3url}/${cdnKey}`;

  return (
    <Stack direction="row" spacing={2}>
      {cdnKey && (
        <a href={imgUrl} rel="noreferrer" target="_blank">
          <Image
            alt="Alt text generated dynamically on view page"
            height={75}
            src={imgUrl}
            style={{ objectFit: "cover" }}
            unoptimized={true /* Not optimized in edit mode */}
            width={75}
          />
        </a>
      )}
      <Button component="label" disabled={loading || uploading}>
        {uploading ? "Uploading..." : cdnKey ? "Change Image" : "Upload Image"}
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
          component="label"
          onClick={() => handleChange_field(null)}
          disabled={loading || uploading}
        >
          Delete Image
        </Button>
      )}
    </Stack>
  );
}
