import { z } from "zod";

/**
 * Discriminated union so the "flag_note required when Flagged" rule is
 * representable in the generated JSON Schema (as a oneOf), not just a Zod
 * runtime refinement. Schema-driven clients see the constraint.
 */
const FlaggedShape = z
  .object({
    review_status: z.literal("Flagged"),
    flag_note: z
      .string()
      .trim()
      .min(1, "flag_note is required when flagging a sketch")
      .describe("Reason text — required when flagging (whitespace trimmed)."),
  })
  .describe("Flagging variant: flag_note is required.");

const NonFlaggedShape = z
  .object({
    review_status: z.enum(["NeedsReview", "Reviewed", "Reprocessing"]),
    flag_note: z
      .string()
      .nullish()
      .describe("Optional. Cleared when null is sent."),
  })
  .describe("Non-flagging variant: flag_note is optional.");

export const ReviewStatusInputSchema = z
  .discriminatedUnion("review_status", [FlaggedShape, NonFlaggedShape])
  .describe("Request body for PUT /sketches/{id}/review-status");

export type ReviewStatusInput = z.infer<typeof ReviewStatusInputSchema>;
