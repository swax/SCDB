import { z } from "zod";
import { positiveId } from "./common";

export const PersonImageInputSchema = z
  .object({
    image_id: positiveId.describe(
      "ID of the image (from POST /upload-image/direct). Upload the image first.",
    ),
    description: z
      .string()
      .nullish()
      .describe("Optional description of the image"),
  })
  .describe(
    "An image entry for a person. Upload the image first via POST /upload-image/direct to get the image_id.",
  );

export const PersonInputSchema = z
  .object({
    name: z.string().min(1).describe("Full name"),
    description: z.string().nullish().describe("Bio or description"),
    gender: z.enum(["Male", "Female", "Other"]).describe("Gender"),
    birth_date: z.iso.date().nullish().describe("Birthday (YYYY-MM-DD)"),
    death_date: z.iso.date().nullish().describe("Date of death (YYYY-MM-DD)"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links (e.g. Wikipedia, IMDb)"),
    images: z
      .array(PersonImageInputSchema)
      .optional()
      .describe(
        "Images for this person. Upload each via POST /upload-image/direct first to get an image_id.",
      ),
  })
  .describe("Request body for creating a new person (POST /people)");

export const PersonUpdateInputSchema = PersonInputSchema.partial().describe(
  "Request body for updating a person (PUT /people/{id}). All fields optional. " +
    "Only provided fields are updated. For the images array, providing it replaces ALL " +
    "existing images; omitting leaves them unchanged.",
);

/**
 * Body for POST /people/{id}/images — accepts a single image or an array.
 * The route normalizes to an array before processing.
 */
export const PersonImagesAppendInputSchema = z
  .union([PersonImageInputSchema, z.array(PersonImageInputSchema).min(1)])
  .describe(
    "POST /people/{id}/images body — one PersonImageInput or a non-empty array of them.",
  );

export type PersonImageInput = z.infer<typeof PersonImageInputSchema>;
export type PersonInput = z.infer<typeof PersonInputSchema>;
export type PersonUpdateInput = z.infer<typeof PersonUpdateInputSchema>;
export type PersonImagesAppendInput = z.infer<
  typeof PersonImagesAppendInputSchema
>;
