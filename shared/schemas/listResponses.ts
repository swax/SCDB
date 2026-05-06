import { z } from "zod";
import { positiveId, positiveInt } from "./common";

/** Output schema — describes the shape returned by GET /sketches list items. */
export const SketchListItemSchema = z
  .object({
    id: positiveId,
    title: z.string(),
    url_slug: z.string(),
    site_rating: z.number().nullable(),
    posted_on_socials: z.boolean(),
    review_status: z.enum([
      "NeedsReview",
      "Flagged",
      "Reviewed",
      "Reprocessing",
    ]),
    show: z.object({ title: z.string() }),
    season: z.object({ year: positiveInt }).nullable(),
    created_at: z.iso.datetime(),
  })
  .describe("Sketch summary returned by GET /sketches");

/** Output schema — describes the shape returned by GET /people list items. */
export const PersonListItemSchema = z
  .object({
    id: positiveId,
    name: z.string(),
    url_slug: z.string(),
    birth_date: z.iso.datetime().nullable(),
    death_date: z.iso.datetime().nullable(),
    age: z.number().int().nullable(),
    _count: z.object({
      sketch_casts: z
        .number()
        .int()
        .describe("Number of sketches this person appears in"),
    }),
  })
  .describe("Person summary returned by GET /people");

export type SketchListItem = z.infer<typeof SketchListItemSchema>;
export type PersonListItem = z.infer<typeof PersonListItemSchema>;
