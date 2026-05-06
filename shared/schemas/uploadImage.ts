import { z } from "zod";

/**
 * Documents the shape of the multipart/form-data body for POST /upload-image/direct.
 * The route reads the FormData directly (a Zod parse on multipart isn't useful);
 * this schema exists for OpenAPI/discovery consumers.
 */
export const UploadImageDirectInputSchema = z
  .object({
    file: z
      .string()
      .meta({
        format: "binary",
        description: "The image file (multipart/form-data file field)",
      }),
    table_name: z
      .string()
      .min(1)
      .describe(
        "Target table for organizing the upload (e.g. sketch, sketch_cast, person_image)",
      ),
  })
  .describe(
    "Direct image upload (recommended). POST multipart/form-data to /upload-image/direct " +
      "with 'file' and 'table_name' fields. The server uploads to S3 and creates the image " +
      "record in one step, returning the image_id. No need to compute file hashes or handle " +
      "presigned URLs. Use the returned image_id in sketch, cast, or person image updates.",
  );

export type UploadImageDirectInput = z.infer<typeof UploadImageDirectInputSchema>;
