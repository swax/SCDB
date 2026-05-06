import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { ReviewStatusInputSchema } from "@/shared/schemas/sketch";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);
    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    const body = ReviewStatusInputSchema.parse(await request.json());

    const existing = await prisma.sketch.findUnique({
      where: { id: sketchId },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError(404, "Sketch not found");
    }

    await prisma.sketch.update({
      where: { id: sketchId },
      data: {
        review_status: body.review_status,
        ...("flag_note" in body && { flag_note: body.flag_note ?? null }),
        modified_by_id: user.id,
        modified_at: new Date(),
      },
    });

    return NextResponse.json({
      id: sketchId,
      review_status: body.review_status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
