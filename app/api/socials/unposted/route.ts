import { handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { review_status_type } from "@/shared/enums";
import { UnpostedSketchesParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight projection for the social-posting queue. `teaser` / `synopsis`
 * give the posting agent enough to write a caption without a second fetch;
 * follow the `sketch` link template for video URLs, cast, tags, etc.
 */
type UnpostedSketchRow = {
  id: number;
  url_slug: string;
  title: string;
  teaser: string | null;
  synopsis: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { limit } = UnpostedSketchesParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    // Prisma can't express ORDER BY random(), so the sample is raw SQL.
    // 'Reviewed' is a fixed literal (no injection surface); limit is bound.
    const [sketches, total] = await Promise.all([
      prisma.$queryRaw<UnpostedSketchRow[]>`
        SELECT id, url_slug, title, teaser, synopsis
        FROM sketch
        WHERE posted_on_socials = false
          AND review_status = 'Reviewed'
        ORDER BY random()
        LIMIT ${limit}
      `,
      prisma.sketch.count({
        where: {
          posted_on_socials: false,
          review_status: review_status_type.Reviewed,
        },
      }),
    ]);

    return NextResponse.json({
      sketches,
      total,
      limit,
      _links: [{ rel: "self", href: "/api/socials/unposted" }],
      _linkTemplates: [
        {
          rel: "sketch",
          hrefTemplate: "/api/sketches/{id}",
          title: "Full sketch detail (video URLs, cast, tags, etc.)",
        },
        {
          rel: "mark-posted",
          hrefTemplate: "/api/socials/{id}",
          method: "PUT",
          title:
            "PUT to mark a sketch as posted once shared " +
            "(body: {posted_on_socials: true}). Requires API key.",
        },
      ],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
