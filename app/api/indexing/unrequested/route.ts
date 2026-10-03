import { handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { review_status_type } from "@/shared/enums";
import { UnrequestedIndexingParamsSchema } from "@/shared/schemas/indexing";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { limit } = UnrequestedIndexingParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const where = {
      google_indexing_requested_at: null,
      review_status: { not: review_status_type.Flagged },
    };
    const [sketches, total] = await Promise.all([
      prisma.sketch.findMany({
        where,
        select: { id: true, title: true, url_slug: true },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: limit,
      }),
      prisma.sketch.count({ where }),
    ]);
    return NextResponse.json({
      sketches: sketches.map((sketch) => ({
        ...sketch,
        url: `https://www.sketchtv.lol/sketches/${sketch.url_slug}`,
      })),
      total,
      limit,
      _links: [
        { rel: "self", href: `/api/indexing/unrequested?limit=${limit}` },
        { rel: "input-schema", href: "/api/schemas/GoogleIndexingInput" },
      ],
      _linkTemplates: [
        { rel: "sketch", hrefTemplate: "/api/sketches/{id}" },
        {
          rel: "indexing-status",
          hrefTemplate: "/api/indexing/{id}",
          method: "GET",
        },
        {
          rel: "mark-indexing-requested",
          hrefTemplate: "/api/indexing/{id}",
          method: "PUT",
          title:
            "After Search Console confirms 'Indexing requested', send " +
            "{google_indexing_requested: true}. Requires API key. Records the confirmation only.",
        },
      ],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
