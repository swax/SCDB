import { z } from "zod";
import {
  ChecklistInputSchema,
  ChecklistUpdateSchema,
  ChecklistBulkInputSchema,
  ChecklistBulkResponseSchema,
  ChecklistBacksyncResponseSchema,
} from "@/shared/schemas/checklist";
import {
  CategoryInputSchema,
  CharacterInputSchema,
  EpisodeInputSchema,
  RecurringSketchInputSchema,
  SeasonInputSchema,
  ShowInputSchema,
  TagInputSchema,
} from "@/shared/schemas/entities";
import {
  HateoasActionSchema,
  HateoasLinkSchema,
} from "@/shared/schemas/hateoas";
import {
  ChecklistPaginationParamsSchema,
  EpisodeListParamsSchema,
  PaginationParamsSchema,
  RecurringSketchListParamsSchema,
  SeasonListParamsSchema,
  SketchListParamsSchema,
  TagListParamsSchema,
} from "@/shared/schemas/listParams";
import { ReviewStatusInputSchema } from "@/shared/schemas/sketch";

/**
 * Map of Zod schemas registered with stable component names. Registered with
 * z.globalRegistry so cross-references between Zod schemas emit proper
 * $ref pointers in the generated JSON Schema (instead of inlining).
 */
const ZOD_SCHEMAS: Record<string, z.ZodTypeAny> = {
  ChecklistInput: ChecklistInputSchema,
  ChecklistUpdateInput: ChecklistUpdateSchema,
  ChecklistBulkInput: ChecklistBulkInputSchema,
  ChecklistBulkResponse: ChecklistBulkResponseSchema,
  ChecklistBacksyncResponse: ChecklistBacksyncResponseSchema,
  HateoasLink: HateoasLinkSchema,
  HateoasAction: HateoasActionSchema,
  PaginationParams: PaginationParamsSchema,
  SeasonListParams: SeasonListParamsSchema,
  EpisodeListParams: EpisodeListParamsSchema,
  SketchListParams: SketchListParamsSchema,
  TagListParams: TagListParamsSchema,
  RecurringSketchListParams: RecurringSketchListParamsSchema,
  ChecklistPaginationParams: ChecklistPaginationParamsSchema,
  ReviewStatusInput: ReviewStatusInputSchema,
  ShowInput: ShowInputSchema,
  SeasonInput: SeasonInputSchema,
  EpisodeInput: EpisodeInputSchema,
  RecurringSketchInput: RecurringSketchInputSchema,
  CharacterInput: CharacterInputSchema,
  CategoryInput: CategoryInputSchema,
  TagInput: TagInputSchema,
};

for (const [name, schema] of Object.entries(ZOD_SCHEMAS)) {
  z.globalRegistry.add(schema, { id: name });
}

/**
 * Build OpenAPI-style JSON Schemas for every registered Zod schema, with
 * cross-references rendered as $ref: "#/components/schemas/X".
 */
function buildZodSchemas(): Record<string, object> {
  const out = z.toJSONSchema(z.globalRegistry, {
    target: "draft-7",
    uri: (id) => `#/components/schemas/${id}`,
  }) as { schemas?: Record<string, Record<string, unknown>> };

  const cleaned: Record<string, object> = {};
  for (const [name, schema] of Object.entries(out.schemas ?? {})) {
    delete schema.$schema;
    delete schema.$id;
    cleaned[name] = schema;
  }
  return cleaned;
}

const zodSchemas = buildZodSchemas();

/** Recursively resolve $ref strings against the schema registry */
export function resolveSchemaRefs(
  obj: unknown,
  seen = new Set<string>(),
): unknown {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj))
    return obj.map((item) => resolveSchemaRefs(item, seen));

  const record = obj as Record<string, unknown>;

  // Replace { $ref: "SchemaName" } or { $ref: "#/components/schemas/SchemaName" }
  // with the referenced schema (inline)
  if (typeof record.$ref === "string" && Object.keys(record).length === 1) {
    const raw = record.$ref;
    const refName = raw.startsWith("#/components/schemas/")
      ? raw.slice("#/components/schemas/".length)
      : raw;
    if (seen.has(refName)) return { type: "object", description: refName };
    const referenced = schemaRegistry[refName];
    if (referenced) {
      seen.add(refName);
      return resolveSchemaRefs(referenced, seen);
    }
  }

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    resolved[key] = resolveSchemaRefs(value, seen);
  }
  return resolved;
}

/** JSON Schema definitions for API request/response types, served individually on demand */
export const schemaRegistry: Record<string, object> = {
  SketchInput: {
    type: "object",
    description: "Request body for creating a new sketch (POST /sketches)",
    required: ["title", "show_id"],
    properties: {
      title: { type: "string", description: "Sketch title" },
      show_id: {
        type: "integer",
        description: "ID of the show. Use GET /lookup/show to find IDs.",
      },
      season_id: {
        type: "integer",
        nullable: true,
        description: "ID of the season. Use GET /lookup/season to find IDs.",
      },
      episode_id: {
        type: "integer",
        nullable: true,
        description: "ID of the episode. Use GET /lookup/episode to find IDs.",
      },
      recurring_sketch_id: {
        type: "integer",
        nullable: true,
        description: "ID of the recurring sketch, if applicable.",
      },
      video_urls: {
        type: "array",
        items: { type: "string" },
        description:
          "Video URLs (YouTube, Vimeo, TikTok, Reddit, Facebook, Internet Archive)",
      },
      teaser: {
        type: "string",
        nullable: true,
        description: "Short teaser text",
      },
      synopsis: {
        type: "string",
        nullable: true,
        description: "Full synopsis of the sketch",
      },
      notes: {
        type: "string",
        nullable: true,
        description: "Additional notes",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links",
      },
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of the preview image. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      posted_on_socials: {
        type: "boolean",
        description:
          "Whether this has been posted on social media (defaults to false)",
      },
      cast: {
        type: "array",
        description: "Cast members in the sketch. See CastInput schema.",
        items: { $ref: "CastInput" },
      },
      credits: {
        type: "array",
        description:
          "Credits (writers, directors, etc.). See CreditInput schema.",
        items: { $ref: "CreditInput" },
      },
      quotes: {
        type: "array",
        description:
          'Memorable quotes. Accepts plain strings: ["quote1", "quote2"] or objects: [{"quote": "quote1"}]',
        items: { oneOf: [{ type: "string" }, { $ref: "QuoteInput" }] },
      },
      tags: {
        type: "array",
        description:
          "Tags for categorization. Accepts plain tag IDs: [123, 456] or objects: [{tag_id: 123}]",
        items: { oneOf: [{ type: "integer" }, { $ref: "SketchTagInput" }] },
      },
    },
  },

  SketchUpdateInput: {
    type: "object",
    description:
      "Request body for updating a sketch (PUT /sketches/{id}). All fields optional. " +
      "Only provided fields are updated. For array fields (cast, credits, quotes, tags), " +
      "providing the array replaces ALL existing entries; omitting leaves them unchanged.",
    properties: {
      title: { type: "string" },
      show_id: { type: "integer" },
      season_id: { type: "integer", nullable: true },
      episode_id: { type: "integer", nullable: true },
      recurring_sketch_id: { type: "integer", nullable: true },
      video_urls: { type: "array", items: { type: "string" } },
      teaser: { type: "string", nullable: true },
      synopsis: { type: "string", nullable: true },
      notes: { type: "string", nullable: true },
      link_urls: { type: "array", items: { type: "string" }, nullable: true },
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of the preview image. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      posted_on_socials: { type: "boolean" },
      cast: {
        type: "array",
        description: "Replaces all existing cast entries",
        items: { $ref: "CastInput" },
      },
      credits: {
        type: "array",
        description: "Replaces all existing credit entries",
        items: { $ref: "CreditInput" },
      },
      quotes: {
        type: "array",
        description:
          'Replaces all existing quotes. Accepts plain strings: ["quote1"] or objects: [{"quote": "quote1"}]',
        items: { oneOf: [{ type: "string" }, { $ref: "QuoteInput" }] },
      },
      tags: {
        type: "array",
        description:
          "Replaces all existing tags. Accepts plain tag IDs: [123] or objects: [{tag_id: 123}]",
        items: { oneOf: [{ type: "integer" }, { $ref: "SketchTagInput" }] },
      },
    },
  },

  CastInput: {
    type: "object",
    description:
      'A cast member entry for a sketch. Example: {"person_id": 489, "character_name": "Kylo Ren", "role": "Host"}',
    required: ["role"],
    properties: {
      image_id: {
        type: "integer",
        nullable: true,
        description:
          "Thumbnail image ID for this cast member. Upload via /upload-image/begin + /upload-image/finish first.",
      },
      character_name: {
        type: "string",
        nullable: true,
        description:
          'Name of the character played (e.g. "Kylo Ren", "Stormtrooper"). This is NOT the actor\'s name.',
      },
      character_id: {
        type: "integer",
        nullable: true,
        description:
          "ID of existing character page (optional). Use GET /lookup/character to find IDs.",
      },
      person_id: {
        type: "integer",
        nullable: true,
        description: "ID of the actor. Use GET /lookup/person to find IDs.",
      },
      role: {
        type: "string",
        enum: ["Cast", "Guest", "Host", "Uncredited"],
        description:
          'Actor\'s role type in the production — NOT the character name. Use "Host" for the episode host, "Cast" for regular/featured cast, "Guest" for guest appearances, "Uncredited" for uncredited roles.',
      },
      minor_role: {
        type: "boolean",
        description: "Whether this is a minor/non-speaking role",
      },
    },
  },

  CreditInput: {
    type: "object",
    description: "A credit entry (writer, director, etc.) for a sketch",
    required: ["person_id", "role"],
    properties: {
      person_id: {
        type: "integer",
        description: "ID of the person. Use GET /lookup/person to find IDs.",
      },
      role: {
        type: "string",
        enum: ["Writer", "Director", "Musician", "Other"],
        description: "Credit role",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Additional description for the credit",
      },
    },
  },

  QuoteInput: {
    type: "object",
    description: "A memorable quote from a sketch",
    required: ["quote"],
    properties: {
      quote: { type: "string", description: "The quote text" },
    },
  },

  SketchTagInput: {
    type: "object",
    description: "A tag entry for a sketch (references an existing tag by ID)",
    required: ["tag_id"],
    properties: {
      tag_id: {
        type: "integer",
        description: "ID of the tag. Use GET /lookup/tag to find IDs.",
      },
    },
  },

  SketchListItem: {
    type: "object",
    description: "Sketch summary returned by GET /sketches",
    properties: {
      id: { type: "integer" },
      title: { type: "string" },
      url_slug: { type: "string" },
      site_rating: { type: "number", nullable: true },
      posted_on_socials: { type: "boolean" },
      review_status: {
        type: "string",
        enum: ["NeedsReview", "Flagged", "Reviewed"],
      },
      show: { type: "object", properties: { title: { type: "string" } } },
      season: {
        type: "object",
        nullable: true,
        properties: { year: { type: "integer" } },
      },
      created_at: { type: "string", format: "date-time" },
    },
  },

  PersonInput: {
    type: "object",
    description: "Request body for creating a new person (POST /people)",
    required: ["name", "gender"],
    properties: {
      name: { type: "string", description: "Full name" },
      description: {
        type: "string",
        nullable: true,
        description: "Bio or description",
      },
      gender: {
        type: "string",
        enum: ["Male", "Female", "Other"],
        description: "Gender",
      },
      birth_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Birthday (YYYY-MM-DD)",
      },
      death_date: {
        type: "string",
        format: "date",
        nullable: true,
        description: "Date of death (YYYY-MM-DD)",
      },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
        description: "Related external links (e.g. Wikipedia, IMDb)",
      },
      images: {
        type: "array",
        description:
          "Images for this person. Upload each image via POST /upload-image/direct first to get an image_id.",
        items: { $ref: "PersonImageInput" },
      },
    },
  },

  PersonUpdateInput: {
    type: "object",
    description:
      "Request body for updating a person (PUT /people/{id}). All fields optional. " +
      "Only provided fields are updated. For the images array, providing it replaces ALL " +
      "existing images; omitting leaves them unchanged.",
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
      gender: { type: "string", enum: ["Male", "Female", "Other"] },
      birth_date: { type: "string", format: "date", nullable: true },
      death_date: { type: "string", format: "date", nullable: true },
      link_urls: {
        type: "array",
        items: { type: "string" },
        nullable: true,
      },
      images: {
        type: "array",
        description: "Replaces all existing person images",
        items: { $ref: "PersonImageInput" },
      },
    },
  },

  PersonListItem: {
    type: "object",
    description: "Person summary returned by GET /people",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      url_slug: { type: "string" },
      birth_date: { type: "string", format: "date", nullable: true },
      death_date: { type: "string", format: "date", nullable: true },
      age: { type: "integer", nullable: true },
      _count: {
        type: "object",
        properties: {
          sketch_casts: {
            type: "integer",
            description: "Number of sketches this person appears in",
          },
        },
      },
    },
  },

  ...zodSchemas,

  BatchLookupInput: {
    type: "object",
    description:
      "POST /lookup/batch — look up multiple search terms across multiple tables in one call. " +
      "Keys are table names, values are arrays of search terms. Returns results grouped by table and term. " +
      "Max 20 terms per table. Example: " +
      '{"person": ["Adam Driver", "Mikey Day"], "tag": ["Star Wars", "Kylo Ren"]}',
    additionalProperties: {
      type: "array",
      items: { type: "string" },
      description: "Search terms for this table",
    },
    example: {
      person: ["Adam Driver", "Mikey Day"],
      tag: ["Star Wars", "Undercover Boss"],
      show: ["Saturday Night Live"],
    },
  },

  LookupResult: {
    type: "object",
    description: "A lookup match returned by GET /lookup/{table}",
    properties: {
      id: { type: "integer" },
      label: { type: "string" },
    },
  },

  UploadImageDirectInput: {
    type: "object",
    description:
      "Direct image upload (recommended). POST multipart/form-data to /upload-image/direct " +
      "with 'file' and 'table_name' fields. The server uploads to S3 and creates the image " +
      "record in one step, returning the image_id. No need to compute file hashes or handle " +
      "presigned URLs. Use the returned image_id in sketch, cast, or person image updates.",
    required: ["file", "table_name"],
    properties: {
      file: {
        type: "string",
        format: "binary",
        description: "The image file (multipart/form-data file field)",
      },
      table_name: {
        type: "string",
        description:
          "Target table for organizing the upload (e.g. sketch, sketch_cast, person_image)",
      },
    },
  },

  PersonImageInput: {
    type: "object",
    description:
      "An image entry for a person. Upload the image first via POST /upload-image/direct to get the image_id.",
    required: ["image_id"],
    properties: {
      image_id: {
        type: "integer",
        description:
          "ID of the image (from /upload-image/finish). Upload the image first.",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Optional description of the image",
      },
    },
  },

  SketchFullInput: {
    type: "object",
    description:
      "All-in-one sketch creation. Accepts names instead of IDs — the server resolves shows, " +
      "people, tags, and recurring sketches by name; finds or creates seasons and episodes; " +
      "downloads and uploads images from URLs; creates the sketch; revalidates caches; and " +
      "refreshes search. POST /api/sketches/full",
    required: ["title", "show"],
    properties: {
      title: { type: "string", description: "Sketch title" },
      show: {
        type: "string",
        description:
          'Show name (resolved by lookup). Example: "Saturday Night Live"',
      },
      season_number: {
        type: "integer",
        description:
          "Season number. Will find existing or create new (requires season_year to create).",
      },
      season_year: {
        type: "integer",
        description:
          "Year the season aired. Required only when creating a new season.",
      },
      episode_number: {
        type: "integer",
        description:
          "Episode number (requires season_number). Will find existing or create new.",
      },
      episode_air_date: {
        type: "string",
        format: "date",
        description: "Air date (YYYY-MM-DD). Used when creating a new episode.",
      },
      recurring_sketch: {
        type: "string",
        description:
          'Recurring sketch name (resolved by lookup). Example: "Star Wars Undercover Boss"',
      },
      video_urls: {
        type: "array",
        items: { type: "string" },
        description: "Video URLs",
      },
      teaser: { type: "string", description: "Short teaser text" },
      synopsis: { type: "string", description: "Full synopsis" },
      notes: { type: "string", description: "Additional notes" },
      link_urls: {
        type: "array",
        items: { type: "string" },
        description: "Related external links",
      },
      image_id: {
        type: "integer",
        description:
          "ID of the preview image. Upload via POST /upload-image/direct first.",
      },
      cast: {
        type: "array",
        description: "Cast members, using actor names instead of IDs.",
        items: { $ref: "SketchFullCastInput" },
      },
      credits: {
        type: "array",
        description: "Credits, using person names instead of IDs.",
        items: { $ref: "SketchFullCreditInput" },
      },
      quotes: {
        type: "array",
        items: { type: "string" },
        description: "Memorable quotes (plain strings)",
      },
      tags: {
        type: "array",
        items: { oneOf: [{ type: "string" }, { type: "integer" }] },
        description:
          'Tag names (resolved by lookup) or numeric tag IDs for disambiguation. ' +
          'Example: ["Star Wars", "Undercover Boss", 1726]',
      },
    },
  },

  SketchFullCastInput: {
    type: "object",
    description:
      'A cast member using actor name instead of ID. Example: {"person": "Adam Driver", "character_name": "Kylo Ren", "role": "Host"}',
    required: ["person", "role"],
    properties: {
      person: {
        type: "string",
        description: 'Actor name (resolved by lookup). Example: "Adam Driver"',
      },
      character_name: {
        type: "string",
        description: 'Name of the character played. Example: "Kylo Ren"',
      },
      role: {
        type: "string",
        enum: ["Cast", "Guest", "Host", "Uncredited"],
        description:
          "Actor's role type in the production — NOT the character name.",
      },
      minor_role: { type: "boolean", description: "Minor/non-speaking role" },
      image_id: {
        type: "integer",
        description:
          "Headshot image ID. Upload via POST /upload-image/direct first.",
      },
    },
  },

  SketchFullCreditInput: {
    type: "object",
    description: "A credit entry using person name instead of ID.",
    required: ["person", "role"],
    properties: {
      person: {
        type: "string",
        description: "Person name (resolved by lookup)",
      },
      role: {
        type: "string",
        enum: ["Writer", "Director", "Musician", "Other"],
        description: "Credit role",
      },
      description: {
        type: "string",
        nullable: true,
        description: "Additional description",
      },
    },
  },

  BatchRevalidateInput: {
    type: "object",
    description:
      "Revalidate multiple entities and optionally refresh search in one call. " +
      "POST /api/revalidate",
    properties: {
      entities: {
        type: "array",
        description:
          "Entities to revalidate. Tables use plural names: shows, seasons, episodes, sketches, recurring-sketches, people, characters, categories, tags",
        items: {
          type: "object",
          required: ["table", "id"],
          properties: {
            table: {
              type: "string",
              description: "Plural table name (e.g. sketches, people)",
            },
            id: { type: "integer", description: "Entity ID" },
          },
        },
      },
      refresh_search: {
        type: "boolean",
        description:
          "If true, also refresh the full-text search index (default: false)",
      },
    },
  },
};
