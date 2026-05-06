import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  ActionDef,
  collectionLink,
  resolveActions,
  selfLink,
} from "@/backend/api/hateoasHelpers";
import {
  buildTableCmsFromInput,
  prepareMappingReplacements,
} from "@/backend/api/sketchApiService";
import { getSketch } from "@/backend/content/sketchService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import {
  normalizeSketchShorthand,
  SketchUpdateInputSchema,
} from "@/shared/schemas/sketch";
import { NextRequest, NextResponse } from "next/server";

type SketchActionCtx = { status: string };

const SKETCH_ACTIONS: ActionDef<SketchActionCtx>[] = [
  {
    rel: "update",
    href: "", // filled per-call (uses /api/sketches/full/{id}, different base)
    method: "PUT",
    title:
      "Update sketch (partial — only provided fields are changed). GET /api/sketches/full for schema + example.",
    schema: "SketchUpdateInput",
  },
  {
    rel: "set-review-status",
    path: "/review-status",
    method: "PUT",
    title:
      "Set review_status. Values: NeedsReview, Flagged, Reviewed, Reprocessing. flag_note is required when setting Flagged.",
    schema: "ReviewStatusInput",
    body: { review_status: "Reprocessing", flag_note: null },
  },
  {
    rel: "mark-reprocessing",
    path: "/review-status",
    method: "PUT",
    title:
      "Shortcut: mark this Flagged sketch as Reprocessing after rework.",
    body: { review_status: "Reprocessing" },
    statuses: ["Flagged"],
  },
  {
    rel: "delete",
    method: "DELETE",
    title: "Delete sketch",
  },
];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sketchId = parseInt(id);

    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    const sketch = await getSketch(sketchId);

    if (!sketch) {
      throw new ApiError(404, "Sketch not found");
    }

    const baseHref = `/api/sketches/${sketchId}`;
    const actions = resolveActions<SketchActionCtx>(
      SKETCH_ACTIONS.map((d) =>
        d.rel === "update"
          ? { ...d, href: `/api/sketches/full/${sketchId}` }
          : d,
      ),
      baseHref,
      { status: sketch.review_status },
    );

    return NextResponse.json({
      ...sketch,
      _links: [selfLink(`/sketches/${sketchId}`), collectionLink("sketches", "Sketches")],
      _actions: actions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);

    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    // Verify sketch exists
    const existing = await getSketch(sketchId);
    if (!existing) {
      throw new ApiError(404, "Sketch not found");
    }

    const input = normalizeSketchShorthand(
      SketchUpdateInputSchema.parse(await request.json()),
    );
    const table = await buildTableCmsFromInput(input, true);

    // If mapping arrays are provided, replace all existing rows
    await prepareMappingReplacements(table, sketchId, input);

    const response = await writeFieldValues(user, table, sketchId);

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json({
      id: sketchId,
      url_slug: response.content?.newSlug || existing.url_slug,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);

    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    const table = findAndBuildTableCms("sketch");

    await deleteRow(user, table, sketchId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
