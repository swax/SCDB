import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { SocialPostInputSchema } from "@/shared/schemas/sketch";
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

    const body = SocialPostInputSchema.parse(await request.json());

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
        posted_on_socials: body.posted_on_socials,
        modified_by_id: user.id,
        modified_at: new Date(),
      },
    });

    return NextResponse.json({
      id: sketchId,
      posted_on_socials: body.posted_on_socials,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
