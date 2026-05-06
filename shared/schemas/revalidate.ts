import { z } from "zod";
import { positiveId } from "./common";

/**
 * Plural URL segments accepted as `table` in BatchRevalidateInput.entities.
 * The route translates these via getSingularTableName before dispatching;
 * unknown values are returned as per-entry errors (not whole-batch failures),
 * so the schema keeps `table` as a free string and only documents the valid
 * values in prose. This preserves the existing per-entry tolerance.
 */
const REVALIDATE_TABLE_NAMES =
  "shows, seasons, episodes, sketches, recurring-sketches, people, characters, categories, tags";

const BatchRevalidateEntrySchema = z
  .object({
    table: z
      .string()
      .min(1)
      .describe(`Plural table name (one of: ${REVALIDATE_TABLE_NAMES})`),
    id: positiveId.describe("Entity ID"),
  })
  .describe("A single entity to revalidate.");

const entitiesArray = z
  .array(BatchRevalidateEntrySchema)
  .min(1)
  .describe(
    `Entities to revalidate. Tables use plural names: ${REVALIDATE_TABLE_NAMES}`,
  );

const refreshSearchHint =
  "If true, also refresh the full-text search index (default: false)";

/**
 * Branch 1: revalidate one or more entities. refresh_search is optional.
 */
const RevalidateWithEntitiesSchema = z
  .object({
    entities: entitiesArray,
    refresh_search: z.boolean().optional().describe(refreshSearchHint),
  })
  .strict();

/**
 * Branch 2: refresh search only — refresh_search must be literally `true`
 * and no entities key is permitted (an empty `entities: []` here is just
 * noise; clients should pick one branch or the other).
 */
const RevalidateRefreshOnlySchema = z
  .object({
    refresh_search: z
      .literal(true)
      .describe("Must be true to trigger a search-only refresh"),
  })
  .strict();

export const BatchRevalidateInputSchema = z
  .union([RevalidateWithEntitiesSchema, RevalidateRefreshOnlySchema])
  .describe(
    "Revalidate multiple entities and optionally refresh search in one call. " +
      "Provide at least one of: a non-empty `entities` array, or `refresh_search: true`. " +
      "POST /api/revalidate",
  );

export type BatchRevalidateInput = z.infer<typeof BatchRevalidateInputSchema>;
