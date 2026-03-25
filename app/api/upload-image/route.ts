import { NextResponse } from "next/server";

const API_PREFIX = "/api";
const SCHEMAS = `${API_PREFIX}/schemas`;

export function GET() {
  return NextResponse.json({
    _actions: [
      {
        rel: "begin",
        href: `${API_PREFIX}/upload-image/begin`,
        method: "POST",
        title: "Step 1: Get presigned S3 upload URL",
        schema: `${SCHEMAS}/UploadImageBeginInput`,
      },
      {
        rel: "upload-to-s3",
        title: "Step 2: Upload file directly to S3",
        description:
          "POST the file to the presigned_post.url from step 1 using multipart/form-data. " +
          "Include all fields from presigned_post.fields, plus the file as the last field named 'file'.",
      },
      {
        rel: "finish",
        href: `${API_PREFIX}/upload-image/finish`,
        method: "POST",
        title: "Step 3: Register uploaded image, returns image_id",
        schema: `${SCHEMAS}/UploadImageFinishInput`,
      },
    ],
    _usage: {
      description:
        "After completing the 3-step upload, use the returned image_id to attach the image to a resource:",
      sketch_preview_image: "PUT /api/sketches/{id} with image_id in the body",
      cast_thumbnail:
        "PUT /api/sketches/{id} with cast array containing image_id on each cast entry",
      person_images:
        "PUT /api/people/{id} with images array containing {image_id, description} entries",
    },
  });
}
