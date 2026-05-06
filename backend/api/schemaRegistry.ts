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
import {
  PersonImageInputSchema,
  PersonImagesAppendInputSchema,
  PersonInputSchema,
  PersonUpdateInputSchema,
} from "@/shared/schemas/person";
import {
  CastInputSchema,
  CreditInputSchema,
  QuoteInputSchema,
  ReviewStatusInputSchema,
  SketchInputSchema,
  SketchTagInputSchema,
  SketchUpdateInputSchema,
} from "@/shared/schemas/sketch";
import {
  SketchFullCastInputSchema,
  SketchFullCreditInputSchema,
  SketchFullInputSchema,
  SketchFullUpdateInputSchema,
} from "@/shared/schemas/sketchFull";

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
  PersonInput: PersonInputSchema,
  PersonUpdateInput: PersonUpdateInputSchema,
  PersonImageInput: PersonImageInputSchema,
  PersonImagesAppendInput: PersonImagesAppendInputSchema,
  SketchInput: SketchInputSchema,
  SketchUpdateInput: SketchUpdateInputSchema,
  CastInput: CastInputSchema,
  CreditInput: CreditInputSchema,
  QuoteInput: QuoteInputSchema,
  SketchTagInput: SketchTagInputSchema,
  SketchFullInput: SketchFullInputSchema,
  SketchFullUpdateInput: SketchFullUpdateInputSchema,
  SketchFullCastInput: SketchFullCastInputSchema,
  SketchFullCreditInput: SketchFullCreditInputSchema,
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
