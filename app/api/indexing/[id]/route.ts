import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { GoogleIndexingInputSchema } from "@/shared/schemas/indexing";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };
const select = { id: true, google_indexing_requested_at: true } as const;

function parseSketchId(id: string) {
  const sketchId = Number(id);
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(sketchId)) {
    throw new ApiError(400, "Invalid sketch ID");
  }
  return sketchId;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseSketchId((await params).id);
    const sketch = await prisma.sketch.findUnique({ where: { id }, select });
    if (!sketch) throw new ApiError(404, "Sketch not found");
    return NextResponse.json(sketch);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);
    const id = parseSketchId((await params).id);
    const json: unknown = await request.json().catch(() => {
      throw new ApiError(400, "Invalid JSON body");
    });
    const { google_indexing_requested: requested } =
      GoogleIndexingInputSchema.parse(json);
    const now = new Date();

    // Conditional writes preserve the first timestamp even with concurrent retries.
    // A repeated mark/unmark changes no rows, attribution, or audit history.
    await prisma.sketch.updateMany({
      where: {
        id,
        google_indexing_requested_at: requested ? null : { not: null },
      },
      data: {
        google_indexing_requested_at: requested ? now : null,
        modified_by_id: user.id,
        modified_at: now,
      },
    });
    const sketch = await prisma.sketch.findUnique({ where: { id }, select });
    if (!sketch) throw new ApiError(404, "Sketch not found");
    return NextResponse.json(sketch);
  } catch (error) {
    return handleApiError(error);
  }
}
