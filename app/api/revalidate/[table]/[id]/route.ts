import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import { revalidateEntityById } from "@/backend/api/entityApiService";
import { getSingularTableName } from "@/shared/tableNames";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ table: string; id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await authenticateApiRequest(request);

    const { table: pluralTable, id } = await params;
    const table = getSingularTableName(pluralTable);

    if (!table) {
      throw new ApiError(400, `Unknown resource type: ${pluralTable}`);
    }

    const rowId = parseInt(id);
    if (isNaN(rowId)) throw new ApiError(400, "Invalid ID");

    await revalidateEntityById(table, rowId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
