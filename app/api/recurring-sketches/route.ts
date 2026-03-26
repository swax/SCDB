import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveRecurringSketchLookupSlug,
} from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getRecurringSketchList } from "@/backend/content/recurringSketch";
import { extractIntParams } from "@/backend/content/listHelper";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "recurring-sketches",
        singular: "Recurring Sketch",
        plural: "Recurring Sketches",
        createSchema: "RecurringSketchInput",
        listSchema: "RecurringSketchListParams",
      });
    }

    const params = request.nextUrl.searchParams;
    const result = await getRecurringSketchList({
      search: params.get("search") || undefined,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
      sortField: params.get("sortField") || undefined,
      sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
      extraWhere: extractIntParams(params, ["show_id"]),
    });
    return NextResponse.json({
      recurring_sketches: result.list,
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
    const input = (await request.json()) as Record<string, unknown>;
    if (!input.title)
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    if (!input.show_id)
      return NextResponse.json(
        { error: "show_id is required" },
        { status: 400 },
      );
    const table = buildEntityTableCms("recurring_sketch", input, false);
    await resolveLookupSlugField(table, input, () =>
      resolveRecurringSketchLookupSlug(input),
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
