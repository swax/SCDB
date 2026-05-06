import {
  authenticateApiRequest,
  conflictIfExists,
  handleApiError,
} from "@/backend/api/apiAuth";
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
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { RecurringSketchInputSchema } from "@/shared/schemas/entities";
import { RecurringSketchListParamsSchema } from "@/shared/schemas/listParams";
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

    const { search, page, pageSize, sortField, sortDir, show_id } =
      RecurringSketchListParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const extraWhere: Record<string, number> = {};
    if (show_id !== undefined) extraWhere.show_id = show_id;

    const result = await getRecurringSketchList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      extraWhere,
    });
    return NextResponse.json({
      recurring_sketches: result.list,
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
    const input = RecurringSketchInputSchema.parse(await request.json());
    const conflict = await conflictIfExists(
      "recurring_sketch",
      { show_id: input.show_id, title: input.title },
      "Recurring sketch",
    );
    if (conflict) return conflict;
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
