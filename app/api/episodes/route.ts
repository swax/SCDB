import {
  authenticateApiRequest,
  conflictIfExists,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveEpisodeLookupSlug,
} from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getEpisodesList } from "@/backend/content/episodeService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { EpisodeInputSchema } from "@/shared/schemas/entities";
import { EpisodeListParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "episodes",
        singular: "Episode",
        plural: "Episodes",
        createSchema: "EpisodeInput",
        listSchema: "EpisodeListParams",
      });
    }

    const { search, page, pageSize, sortField, sortDir, season_id, number } =
      EpisodeListParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const extraWhere: Record<string, number> = {};
    if (season_id !== undefined) extraWhere.season_id = season_id;
    if (number !== undefined) extraWhere.number = number;

    const result = await getEpisodesList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      extraWhere,
    });
    return NextResponse.json({
      episodes: result.list,
      total: result.count,
      page,
      pageSize,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const input = EpisodeInputSchema.parse(await request.json());
    const conflict = await conflictIfExists(
      "episode",
      { season_id: input.season_id, number: input.number },
      "Episode",
    );
    if (conflict) return conflict;
    const table = buildEntityTableCms("episode", input, false);
    await resolveLookupSlugField(table, input, () =>
      resolveEpisodeLookupSlug(input),
    );
    const response = await writeFieldValues(user, table, 0);
    if (response.error)
      return NextResponse.json({ error: response.error }, { status: 400 });
    return NextResponse.json(
      { id: response.content?.rowId, url_slug: response.content?.newSlug },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
