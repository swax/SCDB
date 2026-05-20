import { z } from "zod";
import { positiveId } from "./common";

const CAST_ROLES = ["Cast", "Guest", "Host", "Uncredited"] as const;
const CREDIT_ROLES = ["Writer", "Director", "Musician", "Other"] as const;

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

/**
 * Body for PUT /socials/{id} — the social-posting agent flips a sketch's
 * posted_on_socials flag here after sharing it.
 */
export const SocialPostInputSchema = z
  .object({
    posted_on_socials: z
      .boolean()
      .describe(
        "Whether the sketch has been posted on social media. " +
          "Send true after posting it; send false to un-mark.",
      ),
  })
  .describe("Request body for PUT /socials/{id}");

export type SocialPostInput = z.infer<typeof SocialPostInputSchema>;

// ---------------------------------------------------------------------------
// Sketch create / update inputs and their nested children
// ---------------------------------------------------------------------------

export const QuoteInputSchema = z
  .object({
    quote: z.string().min(1).describe("The quote text"),
  })
  .describe("A memorable quote from a sketch");

export const SketchTagInputSchema = z
  .object({
    tag_id: positiveId.describe(
      "ID of the tag. Use GET /lookup/tag to find IDs.",
    ),
  })
  .describe("A tag entry for a sketch (references an existing tag by ID)");

export const CastInputSchema = z
  .object({
    image_id: positiveId
      .nullish()
      .describe(
        "Thumbnail image ID for this cast member. Upload via " +
          "/upload-image/begin + /upload-image/finish first.",
      ),
    character_name: z
      .string()
      .nullish()
      .describe(
        'Name of the character played (e.g. "Kylo Ren", "Stormtrooper"). ' +
          "This is NOT the actor's name.",
      ),
    character_id: positiveId
      .nullish()
      .describe(
        "ID of existing character page (optional). Use GET /lookup/character to find IDs.",
      ),
    person_id: positiveId
      .nullish()
      .describe("ID of the actor. Use GET /lookup/person to find IDs."),
    role: z
      .enum(CAST_ROLES)
      .describe(
        'Actor\'s role type in the production — NOT the character name. ' +
          'Use "Host" for the episode host, "Cast" for regular/featured cast, ' +
          '"Guest" for guest appearances, "Uncredited" for uncredited roles.',
      ),
    minor_role: z
      .boolean()
      .optional()
      .describe("Whether this is a minor/non-speaking role"),
  })
  .describe(
    'A cast member entry for a sketch. ' +
      'Example: {"person_id": 489, "character_name": "Kylo Ren", "role": "Host"}',
  );

export const CreditInputSchema = z
  .object({
    person_id: positiveId.describe(
      "ID of the person. Use GET /lookup/person to find IDs.",
    ),
    role: z.enum(CREDIT_ROLES).describe("Credit role"),
    description: z
      .string()
      .nullish()
      .describe("Additional description for the credit"),
  })
  .describe("A credit entry (writer, director, etc.) for a sketch");

const QuoteOrShorthandSchema = z.union([z.string().min(1), QuoteInputSchema]);
const TagOrShorthandSchema = z.union([positiveId, SketchTagInputSchema]);

const SketchInputBase = z.object({
  title: z.string().min(1).describe("Sketch title"),
  show_id: positiveId.describe(
    "ID of the show. Use GET /lookup/show to find IDs.",
  ),
  season_id: positiveId
    .nullish()
    .describe("ID of the season. Use GET /lookup/season to find IDs."),
  episode_id: positiveId
    .nullish()
    .describe("ID of the episode. Use GET /lookup/episode to find IDs."),
  recurring_sketch_id: positiveId
    .nullish()
    .describe("ID of the recurring sketch, if applicable."),
  video_urls: z
    .array(z.string())
    .optional()
    .describe(
      "Video URLs (YouTube, Vimeo, TikTok, Reddit, Facebook, Internet Archive)",
    ),
  teaser: z.string().nullish().describe("Short teaser text"),
  synopsis: z.string().nullish().describe("Full synopsis of the sketch"),
  notes: z.string().nullish().describe("Additional notes"),
  link_urls: z.array(z.string()).nullish().describe("Related external links"),
  image_id: positiveId
    .nullish()
    .describe(
      "ID of the preview image. Upload via /upload-image/begin + /upload-image/finish first.",
    ),
  posted_on_socials: z
    .boolean()
    .optional()
    .describe("Whether this has been posted on social media"),
  cast: z
    .array(CastInputSchema)
    .optional()
    .describe("Cast members in the sketch."),
  credits: z
    .array(CreditInputSchema)
    .optional()
    .describe("Credits (writers, directors, etc.)."),
  quotes: z
    .array(QuoteOrShorthandSchema)
    .optional()
    .describe(
      'Memorable quotes. Accepts plain strings: ["quote1", "quote2"] or objects: [{"quote": "quote1"}]',
    ),
  tags: z
    .array(TagOrShorthandSchema)
    .optional()
    .describe(
      "Tags for categorization. Accepts plain tag IDs: [123, 456] or objects: [{tag_id: 123}]",
    ),
});

export const SketchInputSchema = SketchInputBase.describe(
  "Request body for creating a new sketch (POST /sketches)",
);

export const SketchUpdateInputSchema = SketchInputBase.partial().describe(
  "Request body for updating a sketch (PUT /sketches/{id}). All fields optional. " +
    "Only provided fields are updated. For array fields (cast, credits, quotes, tags), " +
    "providing the array replaces ALL existing entries; omitting leaves them unchanged.",
);

export type QuoteInput = z.infer<typeof QuoteInputSchema>;
export type SketchTagInput = z.infer<typeof SketchTagInputSchema>;
export type CastInput = z.infer<typeof CastInputSchema>;
export type CreditInput = z.infer<typeof CreditInputSchema>;
export type SketchInputRaw = z.infer<typeof SketchInputSchema>;
export type SketchUpdateInputRaw = z.infer<typeof SketchUpdateInputSchema>;

/**
 * Canonical (post-normalize) form of SketchInput where shorthand quotes/tags
 * have been coerced. This is what `buildTableCmsFromInput` consumes.
 */
export type SketchInput = Omit<SketchInputRaw, "quotes" | "tags"> & {
  quotes?: QuoteInput[];
  tags?: SketchTagInput[];
};

export type SketchUpdateInput = Omit<SketchUpdateInputRaw, "quotes" | "tags"> & {
  quotes?: QuoteInput[];
  tags?: SketchTagInput[];
};

/**
 * Coerce shorthand forms in parsed sketch input to canonical:
 *   - quotes: "text" → {quote: "text"}
 *   - tags: 123 → {tag_id: 123}
 * Pure function — does not mutate input.
 */
export function normalizeSketchShorthand<
  T extends SketchInputRaw | SketchUpdateInputRaw,
>(input: T): T extends SketchInputRaw ? SketchInput : SketchUpdateInput {
  const out = { ...input } as Record<string, unknown>;
  if (input.quotes) {
    out.quotes = input.quotes.map((q) =>
      typeof q === "string" ? { quote: q } : q,
    );
  }
  if (input.tags) {
    out.tags = input.tags.map((t) =>
      typeof t === "number" ? { tag_id: t } : t,
    );
  }
  return out as T extends SketchInputRaw ? SketchInput : SketchUpdateInput;
}
