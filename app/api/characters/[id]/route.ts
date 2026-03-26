import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import { buildEntityTableCms } from "@/backend/api/entityApiService";
import { getCharacter } from "@/backend/content/characterService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");
    const result = await getCharacter(rowId);
    if (!result) throw new ApiError(404, "Character not found");
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
    const existing = await getCharacter(rowId);
    if (!existing) throw new ApiError(404, "Character not found");
    const input = (await request.json()) as Record<string, unknown>;
    const table = buildEntityTableCms("character", input, true);
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
    const table = findAndBuildTableCms("character");
    await deleteRow(user, table, rowId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
