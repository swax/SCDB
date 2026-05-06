import { z } from "zod";
import { positiveId, positiveInt } from "./common";

const CAST_ROLES = ["Cast", "Guest", "Host", "Uncredited"] as const;
const CREDIT_ROLES = ["Writer", "Director", "Musician", "Other"] as const;

export const SketchFullCastInputSchema = z
  .object({
    person: z
      .string()
      .min(1)
      .describe('Actor name (resolved by lookup). Example: "Adam Driver"'),
    character_name: z
      .string()
      .optional()
      .describe('Name of the character played. Example: "Kylo Ren"'),
    role: z
      .enum(CAST_ROLES)
      .describe(
        "Actor's role type in the production — NOT the character name. " +
          'Use "Host" for the episode host, "Cast" for regular/featured cast, ' +
          '"Guest" for guest appearances, "Uncredited" for uncredited roles.',
      ),
    minor_role: z
      .boolean()
      .optional()
      .describe("Whether this is a minor/non-speaking role"),
    image_id: positiveId
      .optional()
      .describe(
        "Headshot image ID. Upload via POST /upload-image/direct first.",
      ),
  })
  .describe(
    'A cast member using actor name instead of ID. ' +
      'Example: {"person": "Adam Driver", "character_name": "Kylo Ren", "role": "Host"}',
  );

export const SketchFullCreditInputSchema = z
  .object({
    person: z
      .string()
      .min(1)
      .describe("Person name (resolved by lookup)"),
    role: z.enum(CREDIT_ROLES).describe("Credit role"),
    description: z
      .string()
      .optional()
      .describe("Additional description"),
  })
  .describe("A credit entry using person name instead of ID.");

const SketchFullInputBase = z.object({
  title: z.string().min(1).describe("Sketch title"),
  show: z
    .string()
    .min(1)
    .describe('Show name (resolved by lookup). Example: "Saturday Night Live"'),
  season_number: positiveInt
    .optional()
    .describe(
      "Season number. Will find existing or create new (requires season_year to create).",
    ),
  season_year: positiveInt
    .optional()
    .describe("Year the season aired. Required only when creating a new season."),
  episode_number: positiveInt
    .optional()
    .describe(
      "Episode number (requires season_number). Will find existing or create new.",
    ),
  episode_air_date: z.iso
    .date()
    .optional()
    .describe("Air date (YYYY-MM-DD). Used when creating a new episode."),
  recurring_sketch: z
    .string()
    .optional()
    .describe(
      'Recurring sketch name (resolved by lookup). Example: "Star Wars Undercover Boss"',
    ),
  video_urls: z.array(z.string()).optional().describe("Video URLs"),
  teaser: z.string().optional().describe("Short teaser text"),
  synopsis: z.string().optional().describe("Full synopsis"),
  notes: z.string().optional().describe("Additional notes"),
  link_urls: z
    .array(z.string())
    .optional()
    .describe("Related external links"),
  image_id: positiveId
    .optional()
    .describe(
      "ID of the preview image. Upload via POST /upload-image/direct first.",
    ),
  cast: z
    .array(SketchFullCastInputSchema)
    .optional()
    .describe("Cast members, using actor names instead of IDs."),
  credits: z
    .array(SketchFullCreditInputSchema)
    .optional()
    .describe("Credits, using person names instead of IDs."),
  quotes: z
    .array(z.string().min(1))
    .optional()
    .describe("Memorable quotes (plain strings)"),
  tags: z
    .array(z.union([z.string().min(1), positiveId]))
    .optional()
    .describe(
      'Tag names (resolved by lookup) or numeric tag IDs for disambiguation. ' +
        'Example: ["Star Wars", "Undercover Boss", 1726]',
    ),
});

export const SketchFullInputSchema = SketchFullInputBase.describe(
  "All-in-one sketch creation. Accepts names instead of IDs — the server resolves shows, " +
    "people, tags, and recurring sketches by name; finds or creates seasons and episodes; " +
    "creates the sketch; revalidates caches; and refreshes search. POST /api/sketches/full",
);

export const SketchFullUpdateInputSchema = SketchFullInputBase.partial().describe(
  "All-in-one sketch update. All fields optional — only provided fields are changed. " +
    "For array fields (cast, credits, quotes, tags), providing the array replaces ALL existing " +
    "entries; omitting leaves them unchanged. PUT /api/sketches/full/{id}",
);

export type SketchFullCastInput = z.infer<typeof SketchFullCastInputSchema>;
export type SketchFullCreditInput = z.infer<typeof SketchFullCreditInputSchema>;
export type SketchFullInput = z.infer<typeof SketchFullInputSchema>;
export type SketchFullUpdateInput = z.infer<typeof SketchFullUpdateInputSchema>;
