import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { backsyncAllSketches } from "@/backend/content/checklistSync";
import { ChecklistBacksyncResponseSchema } from "@/shared/schemas/checklist";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const result = ChecklistBacksyncResponseSchema.parse(
      await backsyncAllSketches(user.id),
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
