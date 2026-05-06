import { z } from "zod";

export const ChecklistInputSchema = z
  .object({
    show_id: z
      .number()
      .int()
      .describe("ID of the show. Use GET /lookup/show to find IDs."),
    season_number: z
      .number()
      .int()
      .describe(
        "Season number within the show (1-based). Use -1 for sketches with no known season.",
      ),
    episode_number: z
      .number()
      .int()
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
    sketch_id: z
      .number()
      .int()
      .nullish()
      .describe("ID of the sketch if it was ultimately added to the database"),
  })
  .describe("Request body for creating a checklist item (POST /checklist)");

export const ChecklistUpdateSchema = ChecklistInputSchema.partial().describe(
  "Request body for updating a checklist item (PUT /checklist/{id}). " +
    "All fields optional — only provided fields are updated.",
);

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
export type ChecklistBacksyncResponse = z.infer<
  typeof ChecklistBacksyncResponseSchema
>;
