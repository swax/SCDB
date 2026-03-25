import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveTagLookupSlug,
} from "@/backend/api/entityApiService";
import { getTag } from "@/backend/content/tagService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");
    const result = await getTag(rowId);
    if (!result) throw new ApiError(404, "Tag not found");
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
    const existing = await getTag(rowId);
    if (!existing) throw new ApiError(404, "Tag not found");
    const input = await request.json();
    const table = buildEntityTableCms("tag", input, true);
    if (input.name || input.category_id) {
      const merged = {
        name: existing.name,
        category_id: existing.category.id,
        ...input,
      };
      await resolveLookupSlugField(table, input, () =>
        resolveTagLookupSlug(merged),
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
    const table = findAndBuildTableCms("tag");
    await deleteRow(user, table, rowId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
