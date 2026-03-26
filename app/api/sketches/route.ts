import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import {
  buildTableCmsFromInput,
  setReviewStatusForApiContent,
  SketchInput,
} from "@/backend/api/sketchApiService";
import { getSketchList } from "@/backend/content/sketchService";
import { extractIntParams } from "@/backend/content/listHelper";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "sketches",
        singular: "Sketch",
        plural: "Sketches",
        createSchema: "SketchInput",
        updateSchema: "SketchUpdateInput",
        listSchema: "SketchListParams",
      });
    }

    const params = request.nextUrl.searchParams;

    const result = await getSketchList({
      search: params.get("search") || undefined,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
      sortField: params.get("sortField") || undefined,
      sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
      extraWhere: extractIntParams(params, [
        "show_id",
        "season_id",
        "episode_id",
        "recurring_sketch_id",
      ]),
    });

    return NextResponse.json({
      sketches: result.list,
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

    const input = (await request.json()) as SketchInput;

    if (!input.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!input.show_id) {
      return NextResponse.json(
        { error: "show_id is required" },
        { status: 400 },
      );
    }

    const table = await buildTableCmsFromInput(input, false);
    setReviewStatusForApiContent(table);

    const response = await writeFieldValues(user, table, 0);

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: response.content?.rowId,
        url_slug: response.content?.newSlug,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
