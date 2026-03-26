import { ApiError } from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveSeasonLookupSlug,
  resolveEpisodeLookupSlug,
} from "@/backend/api/entityApiService";
import {
  InputValidationError,
  SketchInput,
  CastInput,
  CreditInput,
} from "@/backend/api/sketchApiService";
import lookupTermsInTable from "@/backend/edit/lookupService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import prisma from "@/database/prisma";
import { SessionUser } from "next-auth";

/** Lookup configs matching the ones in the batch lookup route */
const lookupConfigs: Record<string, { table: string; labelColumn: string }> = {
  show: { table: "show", labelColumn: "title" },
  season: { table: "season", labelColumn: "lookup_slug" },
  person: { table: "person", labelColumn: "name" },
  tag: { table: "tag", labelColumn: "lookup_slug" },
  recurring_sketch: {
    table: "recurring_sketch",
    labelColumn: "lookup_slug",
  },
};

/** Input format accepted by both create and update full endpoints */
export interface SketchFullInput {
  title?: string;
  show?: string;
  season_number?: number;
  season_year?: number;
  episode_number?: number;
  episode_air_date?: string;
  recurring_sketch?: string;
  video_urls?: string[];
  teaser?: string;
  synopsis?: string;
  notes?: string;
  link_urls?: string[];
  image_id?: number;
  cast?: FullCastInput[];
  credits?: FullCreditInput[];
  quotes?: string[];
  tags?: string[];
}

export interface FullCastInput {
  person: string;
  character_name?: string;
  role: string;
  minor_role?: boolean;
  image_id?: number;
}

export interface FullCreditInput {
  person: string;
  role: string;
  description?: string;
}

/** Result of resolving all names/URLs in a SketchFullInput */
export interface ResolvedSketchInput {
  sketchInput: SketchInput;
  showId: number;
  seasonId?: number;
  episodeId?: number;
  recurringSketchId?: number;
  thumbnailImageId?: number;
  tagIds: number[];
  castItems: NonNullable<SketchInput["cast"]>;
  creditItems: NonNullable<SketchInput["credits"]>;
}

/** Resolve a name to an ID via the lookup service */
export async function resolveName(
  table: string,
  name: string,
  label: string,
): Promise<number> {
  const config = lookupConfigs[table];
  if (!config) throw new ApiError(500, `Unknown lookup table: ${table}`);

  const result = await lookupTermsInTable(name, config, 5);
  const matches = result.content || [];

  if (matches.length === 0) {
    throw new InputValidationError(`${label} not found: "${name}"`);
  }

  // Prefer exact match (case-insensitive) if available
  const exact = matches.find(
    (m: { label: string }) => m.label.toLowerCase() === name.toLowerCase(),
  );
  if (exact) return exact.id as number;

  if (matches.length === 1) return matches[0].id as number;

  const options = matches
    .slice(0, 5)
    .map((m: { id: number; label: string }) => `${m.label} (id:${m.id})`)
    .join(", ");
  throw new InputValidationError(
    `${label} "${name}" is ambiguous. Matches: ${options}. Use the standard /api/sketches endpoints with explicit IDs instead.`,
  );
}

/** Find or create a season, returning its ID */
export async function findOrCreateSeason(
  user: SessionUser,
  showId: number,
  number: number,
  year?: number,
): Promise<number> {
  const existing = await prisma.season.findFirst({
    where: { show_id: showId, number },
    select: { id: true },
  });
  if (existing) return existing.id;

  if (!year) {
    throw new InputValidationError(
      `Season ${number} does not exist. Provide season_year to create it.`,
    );
  }

  const input = { show_id: showId, year, number };
  const table = buildEntityTableCms("season", input, false);
  await resolveLookupSlugField(table, input, () =>
    resolveSeasonLookupSlug(input),
  );
  const response = await writeFieldValues(user, table, 0);
  if (response.error) throw new InputValidationError(response.error);
  return response.content!.rowId;
}

/** Find or create an episode, returning its ID */
export async function findOrCreateEpisode(
  user: SessionUser,
  seasonId: number,
  number: number,
  airDate?: string,
): Promise<number> {
  const existing = await prisma.episode.findFirst({
    where: { season_id: seasonId, number },
    select: { id: true },
  });
  if (existing) return existing.id;

  const input: Record<string, unknown> = { season_id: seasonId, number };
  if (airDate) input.air_date = airDate;
  const table = buildEntityTableCms("episode", input, false);
  await resolveLookupSlugField(table, input, () =>
    resolveEpisodeLookupSlug(input),
  );
  const response = await writeFieldValues(user, table, 0);
  if (response.error) throw new InputValidationError(response.error);
  return response.content!.rowId;
}

/**
 * Resolve all names in a SketchFullInput to IDs.
 * Used by both create (POST) and update (PUT) handlers.
 */
export async function resolveFullInput(
  user: SessionUser,
  input: SketchFullInput,
  existingShowId?: number,
): Promise<ResolvedSketchInput> {
  // Resolve show
  const showId = input.show
    ? await resolveName("show", input.show, "Show")
    : existingShowId;

  if (!showId) {
    throw new InputValidationError("show is required");
  }

  // Resolve season
  let seasonId: number | undefined;
  if (input.season_number !== undefined) {
    seasonId = await findOrCreateSeason(
      user,
      showId,
      input.season_number,
      input.season_year,
    );
  }

  // Resolve episode
  let episodeId: number | undefined;
  if (input.episode_number !== undefined) {
    if (!seasonId) {
      throw new InputValidationError("episode_number requires season_number");
    }
    episodeId = await findOrCreateEpisode(
      user,
      seasonId,
      input.episode_number,
      input.episode_air_date,
    );
  }

  // Resolve recurring sketch
  let recurringSketchId: number | undefined;
  if (input.recurring_sketch) {
    recurringSketchId = await resolveName(
      "recurring_sketch",
      input.recurring_sketch,
      "Recurring sketch",
    );
  }

  // Resolve tags
  const tagIds: number[] = [];
  if (input.tags) {
    for (const tagName of input.tags) {
      tagIds.push(await resolveName("tag", tagName, "Tag"));
    }
  }

  const thumbnailImageId = input.image_id;

  // Resolve cast
  const castItems: NonNullable<SketchInput["cast"]> = [];
  if (input.cast) {
    for (const castEntry of input.cast) {
      const personId = await resolveName(
        "person",
        castEntry.person,
        "Cast person",
      );

      castItems.push({
        person_id: personId,
        character_name: castEntry.character_name || null,
        role: castEntry.role as CastInput["role"],
        minor_role: castEntry.minor_role ?? false,
        image_id: castEntry.image_id ?? null,
      });
    }
  }

  // Resolve credits
  const creditItems: NonNullable<SketchInput["credits"]> = [];
  if (input.credits) {
    for (const creditEntry of input.credits) {
      const personId = await resolveName(
        "person",
        creditEntry.person,
        "Credit person",
      );
      creditItems.push({
        person_id: personId,
        role: creditEntry.role as CreditInput["role"],
        description: creditEntry.description || null,
      });
    }
  }

  // Build the SketchInput
  const sketchInput: SketchInput = {};

  if (input.title !== undefined) sketchInput.title = input.title;
  if (input.show !== undefined) sketchInput.show_id = showId;
  if (input.season_number !== undefined)
    sketchInput.season_id = seasonId ?? null;
  if (input.episode_number !== undefined)
    sketchInput.episode_id = episodeId ?? null;
  if (input.recurring_sketch !== undefined)
    sketchInput.recurring_sketch_id = recurringSketchId ?? null;
  if (input.video_urls !== undefined) sketchInput.video_urls = input.video_urls;
  if (input.teaser !== undefined) sketchInput.teaser = input.teaser ?? null;
  if (input.synopsis !== undefined)
    sketchInput.synopsis = input.synopsis ?? null;
  if (input.notes !== undefined) sketchInput.notes = input.notes ?? null;
  if (input.link_urls !== undefined)
    sketchInput.link_urls = input.link_urls ?? [];
  if (thumbnailImageId) sketchInput.image_id = thumbnailImageId;

  sketchInput.posted_on_socials = false;

  if (castItems.length > 0) sketchInput.cast = castItems;
  if (creditItems.length > 0) sketchInput.credits = creditItems;
  if (input.quotes !== undefined) sketchInput.quotes = input.quotes;
  if (tagIds.length > 0) sketchInput.tags = tagIds;

  return {
    sketchInput,
    showId,
    seasonId,
    episodeId,
    recurringSketchId,
    thumbnailImageId,
    tagIds,
    castItems,
    creditItems,
  };
}

/** Build the resolved response payload */
export function buildResolvedResponse(resolved: ResolvedSketchInput) {
  return {
    show_id: resolved.showId,
    season_id: resolved.seasonId,
    episode_id: resolved.episodeId,
    recurring_sketch_id: resolved.recurringSketchId,
    thumbnail_image_id: resolved.thumbnailImageId,
    tag_ids: resolved.tagIds,
    cast: resolved.castItems.map((c) => ({
      person_id: c.person_id,
      image_id: c.image_id,
    })),
  };
}
