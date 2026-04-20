import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { review_status_type } from "@/shared/enums";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

interface ReviewStatusInput {
  review_status: review_status_type;
  flag_note?: string | null;
}

const VALID_STATUSES = new Set(Object.values(review_status_type));

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);
    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    const body = (await request.json()) as ReviewStatusInput;

    if (!VALID_STATUSES.has(body.review_status)) {
      throw new ApiError(
        400,
        `review_status must be one of: ${[...VALID_STATUSES].join(", ")}`,
      );
    }

    if (
      body.review_status === review_status_type.Flagged &&
      !body.flag_note?.trim()
    ) {
      throw new ApiError(400, "flag_note is required when flagging a sketch");
    }

    const existing = await prisma.sketch.findUnique({
      where: { id: sketchId },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError(404, "Sketch not found");
    }

    const data: Record<string, unknown> = {
      review_status: body.review_status,
      modified_by_id: user.id,
      modified_at: new Date(),
    };

    if ("flag_note" in body) {
      data.flag_note = body.flag_note ?? null;
    }

    await prisma.sketch.update({
      where: { id: sketchId },
      data,
    });

    return NextResponse.json({
      id: sketchId,
      review_status: body.review_status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
