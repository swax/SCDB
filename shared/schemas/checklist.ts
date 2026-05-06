import { z } from "zod";
import { positiveId, positiveInt } from "./common";

export const ChecklistInputSchema = z
  .object({
    show_id: positiveId.describe(
      "ID of the show. Use GET /lookup/show to find IDs.",
    ),
    season_number: z
      .number()
      .int()
      .describe(
        "Season number within the show (1-based). Use -1 for sketches with no known season.",
      ),
    episode_number: positiveInt
      .nullish()
      .describe("Episode number within the season (1-based)."),
    sketch_title: z
      .string()
      .min(1)
      .max(200)
      .describe("Title of the sketch to add"),
    status: z
      .enum(["Pending", "Added", "NotFound"])
      .optional()
      .describe("Checklist item status (default: Pending)"),
    video_url: z
      .string()
      .nullish()
      .describe("URL of the video for this sketch"),
    sketch_id: positiveId
      .nullish()
      .describe("ID of the sketch if it was ultimately added to the database"),
  })
  .describe("Request body for creating a checklist item (POST /checklist)");

export const ChecklistUpdateSchema = ChecklistInputSchema.partial().describe(
  "Request body for updating a checklist item (PUT /checklist/{id}). " +
    "All fields optional — only provided fields are updated.",
);

export const ChecklistBulkInputSchema = z
  .object({
    items: z
      .array(ChecklistInputSchema)
      .min(1)
      .max(100)
      .describe("Up to 100 checklist items to insert in one call."),
  })
  .describe("Request body for POST /checklist/bulk");

export const ChecklistBulkResponseSchema = z
  .object({
    ids: z
      .array(z.number().int())
      .describe("IDs of the inserted rows, in input order."),
    count: z.number().int().describe("Number of rows inserted."),
  })
  .describe("Response from POST /checklist/bulk");

export const ChecklistBacksyncResponseSchema = z
  .object({
    inserted: z
      .number()
      .int()
      .describe("Checklist rows newly created for sketches with no existing row"),
    updated: z
      .number()
      .int()
      .describe(
        "Existing rows whose title/season/episode were brought back in sync",
      ),
    total_sketches: z
      .number()
      .int()
      .describe("Total sketches considered"),
  })
  .describe("Response from POST /checklist/backsync");

export type ChecklistInput = z.infer<typeof ChecklistInputSchema>;
export type ChecklistUpdate = z.infer<typeof ChecklistUpdateSchema>;
export type ChecklistBulkInput = z.infer<typeof ChecklistBulkInputSchema>;
export type ChecklistBulkResponse = z.infer<typeof ChecklistBulkResponseSchema>;
export type ChecklistBacksyncResponse = z.infer<
  typeof ChecklistBacksyncResponseSchema
>;
