import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { checklist_status_type } from "@/shared/enums";
import { ChecklistBulkInputSchema } from "@/shared/schemas/checklist";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const { items } = ChecklistBulkInputSchema.parse(await request.json());

    const created = await prisma.checklist.createManyAndReturn({
      data: items.map((input) => ({
        show_id: input.show_id,
        season_number: input.season_number,
        episode_number: input.episode_number ?? null,
        sketch_title: input.sketch_title,
        status: input.status ?? checklist_status_type.Pending,
        video_url: input.video_url ?? null,
        sketch_id: input.sketch_id ?? null,
        created_by_id: user.id,
        modified_by_id: user.id,
      })),
      select: { id: true },
    });

    return NextResponse.json(
      { ids: created.map((r) => r.id), count: created.length },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
