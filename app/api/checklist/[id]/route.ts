import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import { checklist_status_type } from "@/shared/enums";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");

    const item = await prisma.checklist.findUnique({ where: { id: rowId } });
    if (!item) throw new ApiError(404, "Checklist item not found");

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");

    const existing = await prisma.checklist.findUnique({
      where: { id: rowId },
    });
    if (!existing) throw new ApiError(404, "Checklist item not found");

    const input = (await request.json()) as {
      show_id?: number;
      season_id?: number;
      episode_id?: number;
      sketch_title?: string;
      status?: checklist_status_type;
      notes?: string;
      sketch_id?: number;
    };

    const item = await prisma.checklist.update({
      where: { id: rowId },
      data: {
        ...(input.show_id !== undefined && { show_id: input.show_id }),
        ...(input.season_id !== undefined && {
          season_id: input.season_id,
        }),
        ...(input.episode_id !== undefined && {
          episode_id: input.episode_id,
        }),
        ...(input.sketch_title !== undefined && {
          sketch_title: input.sketch_title,
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.sketch_id !== undefined && {
          sketch_id: input.sketch_id,
        }),
        modified_by_id: user.id,
        modified_at: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ id: item.id });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await authenticateApiRequest(request);
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");

    const existing = await prisma.checklist.findUnique({
      where: { id: rowId },
    });
    if (!existing) throw new ApiError(404, "Checklist item not found");

    await prisma.checklist.delete({ where: { id: rowId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
