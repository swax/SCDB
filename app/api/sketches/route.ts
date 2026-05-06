import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import {
  buildTableCmsFromInput,
  normalizeSketchInput,
  setReviewStatusForApiContent,
  SketchInput,
} from "@/backend/api/sketchApiService";
import { syncSketchToChecklist } from "@/backend/content/checklistSync";
import { getSketchList } from "@/backend/content/sketchService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { SketchListParamsSchema } from "@/shared/schemas/listParams";
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
        extraLinks: [
          {
            rel: "create-update-full",
            href: "/api/sketches/full",
            title:
              "RECOMMENDED — create or update a sketch using names instead of IDs. " +
              "POST to create, PUT /{id} to update. GET for schema + example.",
          },
        ],
      });
    }

    const {
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      show_id,
      season_id,
      episode_id,
      recurring_sketch_id,
    } = SketchListParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const extraWhere: Record<string, number> = {};
    if (show_id !== undefined) extraWhere.show_id = show_id;
    if (season_id !== undefined) extraWhere.season_id = season_id;
    if (episode_id !== undefined) extraWhere.episode_id = episode_id;
    if (recurring_sketch_id !== undefined)
      extraWhere.recurring_sketch_id = recurring_sketch_id;

    const result = await getSketchList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      extraWhere,
    });

    return NextResponse.json({
      sketches: result.list,
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

    const input = normalizeSketchInput((await request.json()) as SketchInput);

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

    const sketchId = response.content?.rowId;
    if (sketchId) await syncSketchToChecklist(sketchId, user.id);

    return NextResponse.json(
      {
        id: sketchId,
        url_slug: response.content?.newSlug,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
