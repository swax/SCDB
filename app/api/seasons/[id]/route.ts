import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveSeasonLookupSlug,
} from "@/backend/api/entityApiService";
import { getSeason } from "@/backend/content/seasonService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");
    const result = await getSeason(rowId);
    if (!result) throw new ApiError(404, "Season not found");
    return NextResponse.json(result);
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
    const existing = await getSeason(rowId);
    if (!existing) throw new ApiError(404, "Season not found");
    const input = (await request.json()) as Record<string, unknown>;
    const table = buildEntityTableCms("season", input, true);
    // Resolve lookup_slug if key fields changed
    if (input.show_id || input.year || input.number) {
      const merged = {
        show_id: existing.show.id,
        year: existing.year,
        number: existing.number,
        ...input,
      };
      await resolveLookupSlugField(table, input, () =>
        resolveSeasonLookupSlug(merged),
      );
    }
    const response = await writeFieldValues(user, table, rowId);
    if (response.error)
      return NextResponse.json({ error: response.error }, { status: 400 });
    return NextResponse.json({
      id: rowId,
      url_slug: response.content?.newSlug || existing.url_slug,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");
    const table = findAndBuildTableCms("season");
    await deleteRow(user, table, rowId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
