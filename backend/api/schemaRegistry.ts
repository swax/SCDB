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
import {
  BatchLookupInputSchema,
  LookupResultSchema,
} from "@/shared/schemas/lookup";
import { UploadImageDirectInputSchema } from "@/shared/schemas/uploadImage";
import { BatchRevalidateInputSchema } from "@/shared/schemas/revalidate";
import {
  PersonListItemSchema,
  SketchListItemSchema,
} from "@/shared/schemas/listResponses";

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
  BatchLookupInput: BatchLookupInputSchema,
  LookupResult: LookupResultSchema,
  UploadImageDirectInput: UploadImageDirectInputSchema,
  BatchRevalidateInput: BatchRevalidateInputSchema,
  SketchListItem: SketchListItemSchema,
  PersonListItem: PersonListItemSchema,
};

for (const [name, schema] of Object.entries(ZOD_SCHEMAS)) {
  // Forward .describe() / .meta() text from the schema into the registry entry
  // so top-level descriptions and JSON-Schema-visible metadata (e.g.
  // minProperties) survive z.toJSONSchema; without this they're dropped.
  z.globalRegistry.add(schema, { id: name, ...(schema.meta() ?? {}) });
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

/** JSON Schema definitions for API request/response types, served individually on demand. */
export const schemaRegistry: Record<string, object> = zodSchemas;
