import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

/** POST /api/people/{id}/images — Append one or more images to a person */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const personId = parseInt(id);
    if (isNaN(personId)) {
      throw new ApiError(400, "Invalid person ID");
    }

    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { id: true },
    });
    if (!person) {
      throw new ApiError(404, "Person not found");
    }

    const body = await request.json();

    // Accept single object or array
    const items: { image_id: number; description?: string }[] = Array.isArray(
      body,
    )
      ? body
      : [body];

    if (items.length === 0) {
      throw new ApiError(400, "Provide at least one image_id");
    }

    // Get the current max sequence for this person
    const maxSeq = await prisma.person_image.aggregate({
      where: { person_id: personId },
      _max: { sequence: true },
    });
    let nextSeq = (maxSeq._max.sequence ?? -1) + 1;

    const created: { id: number; image_id: number }[] = [];

    for (const item of items) {
      if (!item.image_id || typeof item.image_id !== "number") {
        throw new ApiError(400, "Each item must have a numeric image_id");
      }

      const record = await prisma.person_image.create({
        data: {
          person_id: personId,
          image_id: item.image_id,
          sequence: nextSeq++,
          description: item.description || null,
          created_by_id: user.id,
          created_at: new Date(),
          modified_by_id: user.id,
          modified_at: new Date(),
        },
      });

      created.push({ id: record.id, image_id: item.image_id });
    }

    return NextResponse.json(
      {
        success: true,
        person_id: personId,
        images_added: created,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
