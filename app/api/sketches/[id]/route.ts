import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildTableCmsFromInput,
  normalizeSketchInput,
  prepareMappingReplacements,
  SketchInput,
} from "@/backend/api/sketchApiService";
import { getSketch } from "@/backend/content/sketchService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json({
      ...sketch,
      _links: [
        { rel: "self", href: `/api/sketches/${sketchId}` },
        { rel: "collection", href: "/api/sketches", title: "Sketches" },
      ],
      _actions: [
        {
          rel: "update",
          href: `/api/sketches/full/${sketchId}`,
          method: "PUT",
          title:
            "Update sketch (partial — only provided fields are changed). GET /api/sketches/full for schema + example.",
        },
        {
          rel: "set-review-status",
          href: `/api/sketches/${sketchId}/review-status`,
          method: "PUT",
          title:
            "Set review_status. Values: NeedsReview, Flagged, Reviewed, Reprocessing. flag_note is required when setting Flagged.",
          body: { review_status: "Reprocessing", flag_note: null },
        },
        {
          rel: "delete",
          href: `/api/sketches/${sketchId}`,
          method: "DELETE",
          title: "Delete sketch",
        },
      ],
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

    const input = normalizeSketchInput((await request.json()) as SketchInput);
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
