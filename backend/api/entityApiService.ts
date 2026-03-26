import { revalidateContent } from "@/app/contentBase";
import prisma, { getPrismaModel } from "@/database/prisma";
import { review_status_type } from "@/shared/enums";
import { FieldCmsValueType, TableCms } from "../cms/cmsTypes";
import { findAndBuildTableCms } from "../edit/editReadService";
import { ApiError } from "./apiAuth";

/**
 * Generic builder that creates a TableCms from a flat JSON input for any
 * entity. Handles scalar fields, date conversion, and lookup_slug resolution.
 */
export function buildEntityTableCms(
  tableName: string,
  input: Record<string, unknown>,
  isUpdate: boolean,
): TableCms {
  const table = findAndBuildTableCms(tableName);
  table.operation = isUpdate ? "update" : "create";

  for (const field of table.fields) {
    if (!field.column || field.type === "mapping") continue;

    // url_slug is auto-derived by updateSlugs() in the write service
    if (field.type === "slug") continue;

    const key = field.column;

    if (key in input) {
      let value = input[key] as FieldCmsValueType;

      if (field.type === "date" && value) {
        value = new Date(value as string);
      }

      (field as { values: FieldCmsValueType[] }).values = [value];
      field.modified = [true];
    }
  }

  // Mark API content for review
  table.fields.push({
    label: "Review Status",
    column: "review_status",
    type: "enum",
    enum: "review_status_type",
    values: [review_status_type.NeedsReview],
    modified: [true],
  });

  return table;
}

/**
 * For entities whose lookup_slug is template-based, resolve the template
 * server-side by querying parent entity labels, then set the lookup_slug
 * field value so the write service can derive url_slug from it.
 */
export async function resolveLookupSlugField(
  table: TableCms,
  input: Record<string, unknown>,
  resolver: () => Promise<string>,
) {
  const lookupSlugField = table.fields.find(
    (f) => f.column === "lookup_slug" && f.type === "string",
  );

  if (!lookupSlugField) return;

  // Only resolve if relevant fields changed
  const slug = await resolver();
  lookupSlugField.values = [slug];
  lookupSlugField.modified = [true];
}

/**
 * Look up an entity's url_slug by ID and revalidate its cached page
 * and associated list page.
 */
export async function revalidateEntityById(tableName: string, id: number) {
  const dbTable = tableName.replace("-", "_");
  const row = await getPrismaModel(dbTable).findUnique({
    where: { id },
    select: { url_slug: true },
  });

  if (!row) {
    throw new ApiError(404, `${tableName} with id ${id} not found`);
  }

  revalidateContent(tableName, row.url_slug as string);
}

// --- Lookup slug resolvers for entities with template-based slugs ---

export async function resolveEpisodeLookupSlug(
  input: Record<string, unknown>,
): Promise<string> {
  const seasonId = input.season_id as number;
  const number = input.number as number;

  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    select: { lookup_slug: true },
  });

  return `${season?.lookup_slug || "Unknown"}E${number}`;
}

export async function resolveSeasonLookupSlug(
  input: Record<string, unknown>,
): Promise<string> {
  const showId = input.show_id as number;
  const year = input.year as number;
  const number = input.number as number;

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { title: true },
  });

  return `${show?.title || "Unknown"} ${year}: S${number}`;
}

export async function resolveRecurringSketchLookupSlug(
  input: Record<string, unknown>,
): Promise<string> {
  const showId = input.show_id as number;
  const title = input.title as string;

  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: { title: true },
  });

  return `${show?.title || "Unknown"}: ${title}`;
}

export async function resolveTagLookupSlug(
  input: Record<string, unknown>,
): Promise<string> {
  const categoryId = input.category_id as number;
  const name = input.name as string;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true },
  });

  return `${category?.name || "Unknown"} / ${name}`;
}
