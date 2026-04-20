import { handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { review_status_type } from "@/shared/enums";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sketches = await prisma.sketch.findMany({
      where: { review_status: review_status_type.Flagged },
      select: {
        id: true,
        title: true,
        url_slug: true,
        flag_note: true,
      },
      orderBy: { modified_at: "asc" },
    });

    return NextResponse.json({
      sketches,
      total: sketches.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
