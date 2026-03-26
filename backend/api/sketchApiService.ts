import prisma, { getPrismaModel } from "@/database/prisma";
import {
  cast_role_type,
  credit_role_type,
  review_status_type,
} from "@/shared/enums";
import { FieldCmsValueType, TableCms } from "../cms/cmsTypes";
import { findAndBuildTableCms } from "../edit/editReadService";
import { convertApiImageFields } from "./apiImageHelper";

/** Flat JSON input for creating/updating a sketch via the API */
export interface SketchInput {
  title?: string;
  show_id?: number;
  season_id?: number | null;
  episode_id?: number | null;
  recurring_sketch_id?: number | null;
  image_id?: number | null;
  video_urls?: string[];
  teaser?: string | null;
  synopsis?: string | null;
  notes?: string | null;
  link_urls?: string[] | null;
  posted_on_socials?: boolean;
  cast?: CastInput[];
  credits?: CreditInput[];
  quotes?: (QuoteInput | string)[];
  tags?: (TagInput | number)[];
}

const VALID_CAST_ROLES = new Set(Object.values(cast_role_type));

function isValidCastRole(value: unknown): value is cast_role_type {
  return (
    typeof value === "string" && VALID_CAST_ROLES.has(value as cast_role_type)
  );
}

/**
 * Normalize shorthand forms in sketch input:
 * - quotes: "text" -> {quote: "text"}
 * - tags: 123 -> {tag_id: 123}
 * - posted_on_socials: defaults to false if not provided
 * - cast: accepts role_type/cast_type as aliases for role, auto-fixes swapped role/character_name
 */
export function normalizeSketchInput(input: SketchInput): SketchInput {
  if (input.posted_on_socials === undefined) {
    input.posted_on_socials = false;
  }

  if (input.quotes) {
    input.quotes = input.quotes.map((q) =>
      typeof q === "string" ? { quote: q } : q,
    );
  }

  if (input.tags) {
    input.tags = input.tags.map((t) =>
      typeof t === "number" ? { tag_id: t } : t,
    );
  }

  if (input.cast) {
    const errors: string[] = [];
    input.cast = input.cast.map((c, i) => {
      // Accept role_type or cast_type as aliases for role
      const alias = c.role_type ?? c.cast_type;
      if (alias && isValidCastRole(alias)) {
        // If role holds what looks like a character name, move it
        if (c.role && !isValidCastRole(c.role) && !c.character_name) {
          c.character_name = c.role as string;
        }
        c.role = alias as cast_role_type;
      }
      delete c.role_type;
      delete c.cast_type;

      // Validate role is a valid enum value
      if (!c.role) {
        errors.push(
          `Cast row ${i + 1}: 'role' is required (one of: ${[...VALID_CAST_ROLES].join(", ")})`,
        );
      } else if (!isValidCastRole(c.role)) {
        errors.push(
          `Cast row ${i + 1}: invalid role "${c.role}". Must be one of: ${[...VALID_CAST_ROLES].join(", ")}. ` +
            `Use 'character_name' for the character's name (e.g. "Kylo Ren"), and 'role' for the actor's role type (e.g. "Host").`,
        );
      }
      return c;
    });
    if (errors.length > 0) {
      throw new InputValidationError(errors.join("\n"));
    }
  }

  return input;
}

/** Thrown for input validation errors that should return 400 with a clear message */
export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

/** Raw cast input from API — may include aliases like role_type/cast_type */
export interface CastInput {
  image_id?: number | null;
  character_name?: string | null;
  character_id?: number | null;
  person_id?: number | null;
  role: cast_role_type;
  minor_role?: boolean;
  // Aliases accepted during normalization
  role_type?: string;
  cast_type?: string;
}

export interface CreditInput {
  person_id: number;
  role: credit_role_type;
  description?: string | null;
}

export interface QuoteInput {
  quote: string;
}

export interface TagInput {
  tag_id: number;
}

/**
 * Resolves the lookup_slug for a sketch by querying the show/season/episode
 * labels, mirroring the client-side template resolution.
 */
async function resolveLookupSlug(
  title: string,
  showId: number,
  seasonId?: number | null,
  episodeId?: number | null,
): Promise<string> {
  // Try episode first, then season, then show
  if (episodeId) {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { lookup_slug: true },
    });
    if (episode?.lookup_slug) {
      return `${episode.lookup_slug}: ${title}`;
    }
  }

  if (seasonId) {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      select: { lookup_slug: true },
    });
    if (season?.lookup_slug) {
      return `${season.lookup_slug}: ${title}`;
    }
  }

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { title: true },
  });

  return `${show?.title || "Unknown"}: ${title}`;
}

/**
 * Builds a TableCms structure from a flat JSON input so we can reuse
 * the existing writeFieldValues / writeMappingChanges pipeline.
 */
export async function buildTableCmsFromInput(
  input: SketchInput,
  isUpdate: boolean,
): Promise<TableCms> {
  const table = findAndBuildTableCms("sketch");
  table.operation = isUpdate ? "update" : "create";

  // Set scalar field values
  for (const field of table.fields) {
    if (!field.column || field.type === "mapping") continue;

    const key = field.column as keyof SketchInput;

    // For creates, handle lookup_slug and url_slug specially
    if (field.column === "lookup_slug") {
      if (input.title && input.show_id) {
        const lookupSlug = await resolveLookupSlug(
          input.title,
          input.show_id,
          input.season_id,
          input.episode_id,
        );
        field.values = [lookupSlug];
        field.modified = [true];
      }
      continue;
    }

    if (field.column === "url_slug") {
      // url_slug is derived from lookup_slug by updateSlugs() in the write service
      continue;
    }

    if (key in input) {
      const values: FieldCmsValueType[] = [input[key] as FieldCmsValueType];
      (field as { values: FieldCmsValueType[] }).values = values;
      field.modified = [true];
    }
  }

  // Set mapping fields
  setMappingField(table, "sketch_cast", input.cast, (item, fields) => {
    for (const field of fields) {
      const key = field.column as keyof CastInput;
      if (key && key in item) {
        field.values ||= [];
        (field.values as FieldCmsValueType[]).push(item[key] ?? null);
        field.modified ||= [];
        field.modified.push(true);
      } else {
        field.values ||= [];
        (field.values as FieldCmsValueType[]).push(null);
        field.modified ||= [];
        field.modified.push(false);
      }
    }
  });

  setMappingField(table, "sketch_credit", input.credits, (item, fields) => {
    for (const field of fields) {
      const key = field.column as keyof CreditInput;
      if (key && key in item) {
        field.values ||= [];
        (field.values as FieldCmsValueType[]).push(item[key] ?? null);
        field.modified ||= [];
        field.modified.push(true);
      } else {
        field.values ||= [];
        (field.values as FieldCmsValueType[]).push(null);
        field.modified ||= [];
        field.modified.push(false);
      }
    }
  });

  setMappingField(
    table,
    "sketch_quote",
    input.quotes as QuoteInput[] | undefined,
    (item, fields) => {
      for (const field of fields) {
        if (field.column === "quote") {
          field.values ||= [];
          (field.values as FieldCmsValueType[]).push(item.quote);
          field.modified ||= [];
          field.modified.push(true);
        }
      }
    },
  );

  setMappingField(
    table,
    "sketch_tag",
    input.tags as TagInput[] | undefined,
    (item, fields) => {
      for (const field of fields) {
        if (field.column === "tag_id") {
          field.values ||= [];
          (field.values as FieldCmsValueType[]).push(item.tag_id);
          field.modified ||= [];
          field.modified.push(true);
        }
      }
    },
  );

  // Convert image fields with integer values to plain FK fields
  // (API passes pre-existing image record IDs, not CDN keys)
  convertApiImageFields(table);

  return table;
}

function setMappingField<T>(
  table: TableCms,
  mappingTableName: string,
  items: T[] | undefined,
  populateFields: (item: T, fields: TableCms["fields"]) => void,
) {
  if (!items || items.length === 0) return;

  const mappingField = table.fields.find(
    (f) => f.type === "mapping" && f.mappingTable.name === mappingTableName,
  );

  if (!mappingField || mappingField.type !== "mapping") return;

  // Each new row gets a negative ID to signal creation
  mappingField.mappingTable.ids = items.map((_, i) => -(i + 1));

  for (const item of items) {
    populateFields(item, mappingField.mappingTable.fields);
  }
}

/**
 * For updates, we need to handle replacing mapping data.
 * If the caller provides a mapping array (e.g. cast), we delete all existing
 * rows and create new ones. If the field is omitted, we leave existing data.
 */
export async function prepareMappingReplacements(
  table: TableCms,
  sketchId: number,
  input: SketchInput,
) {
  const mappingConfigs: {
    key: keyof SketchInput;
    tableName: string;
    navProp: string;
  }[] = [
    { key: "cast", tableName: "sketch_cast", navProp: "sketch_casts" },
    { key: "credits", tableName: "sketch_credit", navProp: "sketch_credits" },
    { key: "quotes", tableName: "sketch_quote", navProp: "sketch_quotes" },
    { key: "tags", tableName: "sketch_tag", navProp: "sketch_tags" },
  ];

  for (const config of mappingConfigs) {
    if (!(config.key in input)) continue;

    const mappingField = table.fields.find(
      (f) => f.type === "mapping" && f.mappingTable.name === config.tableName,
    );

    if (!mappingField || mappingField.type !== "mapping") continue;

    // Get existing IDs to mark for removal
    const existingRows = await getPrismaModel(config.tableName).findMany({
      where: { sketch_id: sketchId },
      select: { id: true },
    });

    mappingField.mappingTable.removeIds = existingRows.map(
      (r) => r.id as number,
    );
  }
}

/**
 * Set review_status to NeedsReview for API-created content
 */
export function setReviewStatusForApiContent(table: TableCms) {
  // Add review_status field to mark API content for review
  table.fields.push({
    label: "Review Status",
    column: "review_status",
    type: "enum",
    enum: "review_status_type",
    values: [review_status_type.NeedsReview],
    modified: [true],
  });
}
