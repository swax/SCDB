import { z } from "zod";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";

/**
 * Optional integer query param that tolerates absent OR empty string.
 * `?show_id=` (sent by some forms when the field is empty) becomes undefined
 * instead of being coerced to 0.
 */
const optionalQueryInt = (description: string) =>
  z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().optional(),
    )
    .describe(description);

/**
 * Standard pagination + sort + search params shared by every list endpoint.
 * Use `z.coerce.number()` because URL query strings are always strings.
 */
export const PaginationParamsSchema = z
  .object({
    search: z
      .string()
      .optional()
      .describe("Case-insensitive name/title search"),
    page: z.coerce.number().int().min(1).default(1).describe("Page number"),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(200)
      .default(getDefaultPageListSize())
      .describe(
        "Results per page (default from DEFAULT_PAGE_LIST_SIZE env var)",
      ),
    sortField: z.string().optional().describe("Field to sort by"),
    sortDir: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
  })
  .describe("Standard pagination / sort / search query parameters.");

export const SeasonListParamsSchema = PaginationParamsSchema.extend({
  show_id: optionalQueryInt("Filter by show ID"),
  number: optionalQueryInt("Filter by season number"),
  year: optionalQueryInt("Filter by year"),
}).describe("Query parameters for GET /seasons. Example: ?show_id=1&number=45");

export const EpisodeListParamsSchema = PaginationParamsSchema.extend({
  season_id: optionalQueryInt("Filter by season ID"),
  number: optionalQueryInt("Filter by episode number"),
}).describe(
  "Query parameters for GET /episodes. Example: ?season_id=28&number=11",
);

export const SketchListParamsSchema = PaginationParamsSchema.extend({
  show_id: optionalQueryInt("Filter by show ID"),
  season_id: optionalQueryInt("Filter by season ID"),
  season_number: optionalQueryInt(
    "Filter by season number. Alone matches that number across all shows; combine with show_id to scope to one show",
  ),
  episode_id: optionalQueryInt("Filter by episode ID"),
  recurring_sketch_id: optionalQueryInt("Filter by recurring sketch ID"),
}).describe(
  "Query parameters for GET /sketches. Example: ?show_id=1&season_number=45",
);

/**
 * GET /socials/unposted returns a *random* sample, so the only parameter
 * is a result cap — pagination, sort, and search don't apply.
 */
export const UnpostedSketchesParamsSchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(30)
      .describe("Maximum sketches to return (default 30, max 100)."),
  })
  .describe("Query parameters for GET /socials/unposted. Example: ?limit=20");

export const TagListParamsSchema = PaginationParamsSchema.extend({
  category_id: optionalQueryInt("Filter by category ID"),
}).describe("Query parameters for GET /tags. Example: ?category_id=5");

export const RecurringSketchListParamsSchema = PaginationParamsSchema.extend({
  show_id: optionalQueryInt("Filter by show ID"),
}).describe(
  "Query parameters for GET /recurring-sketches. Example: ?show_id=1",
);

export const ChecklistPaginationParamsSchema = PaginationParamsSchema.extend({
  status: z
    .enum(["Pending", "Added", "NotFound"])
    .optional()
    .describe("Filter by checklist item status"),
  show_id: optionalQueryInt("Filter by show ID"),
  season_number: optionalQueryInt("Filter by season number"),
}).describe(
  "Query parameters for GET /checklist. Example: ?show_id=1&season_number=45&status=Pending",
);

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type SeasonListParams = z.infer<typeof SeasonListParamsSchema>;
export type EpisodeListParams = z.infer<typeof EpisodeListParamsSchema>;
export type SketchListParams = z.infer<typeof SketchListParamsSchema>;
export type UnpostedSketchesParams = z.infer<
  typeof UnpostedSketchesParamsSchema
>;
export type TagListParams = z.infer<typeof TagListParamsSchema>;
export type RecurringSketchListParams = z.infer<
  typeof RecurringSketchListParamsSchema
>;
export type ChecklistPaginationParams = z.infer<
  typeof ChecklistPaginationParamsSchema
>;
