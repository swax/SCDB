import { z } from "zod";
import { positiveId, positiveInt } from "./common";

/**
 * Simple entity create-input schemas. These mirror the table columns the
 * generic `buildEntityTableCms` walks over — keep field names matching the
 * Prisma columns exactly so the route handlers can pass parsed input through
 * without renaming.
 */

export const ShowInputSchema = z
  .object({
    title: z.string().min(1).describe("Show title"),
    short_name: z
      .string()
      .nullish()
      .describe("Short name / abbreviation"),
    description: z.string().nullish().describe("Show description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe("Request body for creating a show (POST /shows)");

export const SeasonInputSchema = z
  .object({
    show_id: positiveId.describe(
      "ID of the show. Use GET /lookup/show to find IDs.",
    ),
    year: positiveInt.describe("Year the season aired"),
    number: positiveInt.describe("Season number"),
    description: z.string().nullish().describe("Season description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe("Request body for creating a season (POST /seasons)");

export const EpisodeInputSchema = z
  .object({
    season_id: positiveId.describe(
      "ID of the season. Use GET /lookup/season to find IDs.",
    ),
    number: positiveInt.describe("Episode number"),
    air_date: z.iso
      .date()
      .nullish()
      .describe("Air date (YYYY-MM-DD)"),
    title: z.string().nullish().describe("Episode title"),
    description: z.string().nullish().describe("Episode description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe("Request body for creating an episode (POST /episodes)");

export const RecurringSketchInputSchema = z
  .object({
    title: z.string().min(1).describe("Recurring sketch title"),
    show_id: positiveId.describe(
      "ID of the show. Use GET /lookup/show to find IDs.",
    ),
    description: z.string().nullish().describe("Description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe(
    "Request body for creating a recurring sketch (POST /recurring-sketches)",
  );

export const CharacterInputSchema = z
  .object({
    name: z.string().min(1).describe("Character name"),
    person_id: positiveId
      .nullish()
      .describe(
        "If the character portrays a real person, link to them. " +
          "Use GET /lookup/person to find IDs.",
      ),
    description: z.string().nullish().describe("Character description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe("Request body for creating a character (POST /characters)");

export const CategoryInputSchema = z
  .object({
    name: z.string().min(1).describe("Category name"),
  })
  .describe("Request body for creating a category (POST /categories)");

export const TagInputSchema = z
  .object({
    name: z.string().min(1).describe("Tag name"),
    category_id: positiveId.describe(
      "ID of the category. Use GET /lookup/category to find IDs.",
    ),
    description: z.string().nullish().describe("Tag description"),
    link_urls: z
      .array(z.string())
      .nullish()
      .describe("Related external links"),
  })
  .describe("Request body for creating a tag (POST /tags)");

export type ShowInput = z.infer<typeof ShowInputSchema>;
export type SeasonInput = z.infer<typeof SeasonInputSchema>;
export type EpisodeInput = z.infer<typeof EpisodeInputSchema>;
export type RecurringSketchInput = z.infer<typeof RecurringSketchInputSchema>;
export type CharacterInput = z.infer<typeof CharacterInputSchema>;
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
export type TagInput = z.infer<typeof TagInputSchema>;
