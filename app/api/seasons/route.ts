import {
  authenticateApiRequest,
  conflictIfExists,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveSeasonLookupSlug,
} from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getSeasonsList } from "@/backend/content/seasonService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { SeasonInputSchema } from "@/shared/schemas/entities";
import { SeasonListParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "seasons",
        singular: "Season",
        plural: "Seasons",
        createSchema: "SeasonInput",
        listSchema: "SeasonListParams",
      });
    }

    const { search, page, pageSize, sortField, sortDir, show_id, number, year } =
      SeasonListParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const extraWhere: Record<string, number> = {};
    if (show_id !== undefined) extraWhere.show_id = show_id;
    if (number !== undefined) extraWhere.number = number;
    if (year !== undefined) extraWhere.year = year;

    const result = await getSeasonsList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      extraWhere,
    });
    return NextResponse.json({
      seasons: result.list,
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
    const input = SeasonInputSchema.parse(await request.json());
    const conflict = await conflictIfExists(
      "season",
      { show_id: input.show_id, number: input.number },
      "Season",
    );
    if (conflict) return conflict;
    const table = buildEntityTableCms("season", input, false);
    await resolveLookupSlugField(table, input, () =>
      resolveSeasonLookupSlug(input),
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
