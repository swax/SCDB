import { NextResponse } from "next/server";

const API_PREFIX = "/api";
const SCHEMAS = `${API_PREFIX}/schemas`;

export function GET() {
  return NextResponse.json({
    _actions: [
      {
        rel: "direct",
        href: `${API_PREFIX}/upload-image/direct`,
        method: "POST",
        title:
          "Upload image. Send multipart/form-data with 'file' and 'table_name' fields. Returns image_id in one call.",
        schema: `${SCHEMAS}/UploadImageDirectInput`,
      },
    ],
    _usage: {
      description:
        "After uploading, use the returned image_id to attach the image to a resource:",
      sketch_preview_image: "PUT /api/sketches/{id} with image_id in the body",
      cast_thumbnail:
        "PUT /api/sketches/{id} with cast array containing image_id on each cast entry",
      person_images:
        "PUT /api/people/{id} with images array containing {image_id, description} entries",
    },
  });
}
