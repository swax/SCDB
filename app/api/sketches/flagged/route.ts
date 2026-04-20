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
      _links: [{ rel: "self", href: "/api/sketches/flagged" }],
      _linkTemplates: [
        {
          rel: "sketch",
          hrefTemplate: "/api/sketches/{id}",
          title: "Sketch detail (includes review_status, flag_note, _actions)",
        },
        {
          rel: "set-review-status",
          hrefTemplate: "/api/sketches/{id}/review-status",
          method: "PUT",
          title:
            "PUT to mark a flagged sketch as Reprocessing (body: {review_status: 'Reprocessing'}) or flip back to NeedsReview after rework.",
        },
      ],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
