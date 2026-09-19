import { NextRequest, NextResponse } from "next/server";
import { findSketchesBySource } from "@/backend/api/sketchSourceService";
import { handleApiError } from "@/backend/api/apiAuth";
import { sourceVideoKey } from "@/shared/sourceVideo";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url)
      return NextResponse.json({
        description:
          "Exact source-video lookup across all sketches, including those awaiting review. Supply a supported YouTube or Vimeo URL; title search is not a source duplicate check.",
        _linkTemplates: [
          { rel: "lookup", hrefTemplate: "/api/sketches/by-source?url={url}" },
        ],
      });
    const source = sourceVideoKey(url);
    if (!source)
      return NextResponse.json(
        {
          error:
            "Unsupported or invalid source URL. Exact lookup currently supports YouTube and Vimeo.",
        },
        { status: 400 },
      );
    const sketches = await findSketchesBySource([url]);
    return NextResponse.json({
      source,
      sketches,
      total: sketches.length,
      _linkTemplates: [{ rel: "item", hrefTemplate: "/api/sketches/{id}" }],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
