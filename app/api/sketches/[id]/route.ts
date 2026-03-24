import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildTableCmsFromInput,
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
    await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);

    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    const sketch = await getSketch(sketchId);

    if (!sketch) {
      throw new ApiError(404, "Sketch not found");
    }

    return NextResponse.json(sketch);
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

    const input: SketchInput = await request.json();
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
