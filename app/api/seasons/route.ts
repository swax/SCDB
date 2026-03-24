import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveSeasonLookupSlug,
} from "@/backend/api/entityApiService";
import { getSeasonsList } from "@/backend/content/seasonService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await authenticateApiRequest(request);
    const params = request.nextUrl.searchParams;
    const result = await getSeasonsList({
      search: params.get("search") || undefined,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
      sortField: params.get("sortField") || undefined,
      sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
    });
    return NextResponse.json({
      seasons: result.list,
      total: result.count,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const input = await request.json();
    if (!input.show_id)
      return NextResponse.json(
        { error: "show_id is required" },
        { status: 400 },
      );
    if (!input.year)
      return NextResponse.json({ error: "year is required" }, { status: 400 });
    if (!input.number)
      return NextResponse.json(
        { error: "number is required" },
        { status: 400 },
      );
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
