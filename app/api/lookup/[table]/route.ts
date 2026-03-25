import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import lookupTermsInTable from "@/backend/edit/lookupService";
import { NextRequest, NextResponse } from "next/server";

/** Maps API table names to the lookup config used by the existing lookup service */
const lookupConfigs: Record<string, { table: string; labelColumn: string }> = {
  show: { table: "show", labelColumn: "title" },
  season: { table: "season", labelColumn: "lookup_slug" },
  episode: { table: "episode", labelColumn: "lookup_slug" },
  person: { table: "person", labelColumn: "name" },
  character: { table: "character", labelColumn: "name" },
  tag: { table: "tag", labelColumn: "lookup_slug" },
  recurring_sketch: { table: "recurring_sketch", labelColumn: "lookup_slug" },
  category: { table: "category", labelColumn: "name" },
};

type RouteParams = { params: Promise<{ table: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { table } = await params;
    const search = request.nextUrl.searchParams.get("search") || "";

    const config = lookupConfigs[table];
    if (!config) {
      throw new ApiError(
        400,
        `Unknown lookup table: ${table}. Valid tables: ${Object.keys(lookupConfigs).join(", ")}`,
      );
    }

    if (!search) {
      throw new ApiError(400, "search query parameter is required");
    }

    const response = await lookupTermsInTable(search, config);

    return NextResponse.json(response.content || []);
  } catch (error) {
    return handleApiError(error);
  }
}
