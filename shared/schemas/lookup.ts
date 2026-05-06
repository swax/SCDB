import { z } from "zod";
import { positiveId } from "./common";

/** Tables exposed via /api/lookup/{table} and /api/lookup/batch */
export const LOOKUP_TABLES = [
  "show",
  "season",
  "episode",
  "person",
  "character",
  "tag",
  "recurring_sketch",
  "category",
] as const;

const MAX_TERMS_PER_TABLE = 20;

const termsArray = z
  .array(z.string().trim().min(1))
  .max(MAX_TERMS_PER_TABLE)
  .describe(`Search terms for this table (max ${MAX_TERMS_PER_TABLE})`);

/**
 * Each known table is an optional array of search terms. Strict mode rejects
 * unknown table names at parse time; partial makes every key optional, so the
 * client only sends the tables they want to look up.
 */
export const BatchLookupInputSchema = z
  .object({
    show: termsArray,
    season: termsArray,
    episode: termsArray,
    person: termsArray,
    character: termsArray,
    tag: termsArray,
    recurring_sketch: termsArray,
    category: termsArray,
  })
  .partial()
  .strict()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Request body must contain at least one table",
  })
  .describe(
    "POST /lookup/batch — look up multiple search terms across multiple tables in one call. " +
      "Keys are table names, values are arrays of search terms. Returns results grouped by table and term. " +
      "Max 20 terms per table. Example: " +
      '{"person": ["Adam Driver", "Mikey Day"], "tag": ["Star Wars", "Kylo Ren"]}',
  )
  .meta({ minProperties: 1 });

export const LookupResultSchema = z
  .object({
    id: positiveId.describe("Resource ID"),
    label: z.string().describe("Display label"),
  })
  .describe("A lookup match returned by GET /lookup/{table}");

export type BatchLookupInput = z.infer<typeof BatchLookupInputSchema>;
export type LookupResult = z.infer<typeof LookupResultSchema>;
