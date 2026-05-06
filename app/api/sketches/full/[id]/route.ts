import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildTableCmsFromInput,
  prepareMappingReplacements,
  InputValidationError,
} from "@/backend/api/sketchApiService";
import {
  resolveFullInput,
  buildResolvedResponse,
} from "@/backend/api/sketchFullService";
import { getSketch } from "@/backend/content/sketchService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { revalidateSketchAndPeople } from "@/app/api/sketches/full/route";
import { SketchFullUpdateInputSchema } from "@/shared/schemas/sketchFull";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const sketchId = parseInt(id);
    if (isNaN(sketchId)) {
      throw new ApiError(400, "Invalid sketch ID");
    }

    // Verify sketch exists
    const existing = await getSketch(sketchId);
    if (!existing) {
      throw new ApiError(404, "Sketch not found");
    }

    const input = SketchFullUpdateInputSchema.parse(await request.json());

    // For updates, resolve names using the existing show_id as fallback
    const resolved = await resolveFullInput(user, input, existing.show.id);
    const table = await buildTableCmsFromInput(resolved.sketchInput, true);

    // If mapping arrays are provided, replace all existing rows
    await prepareMappingReplacements(table, sketchId, resolved.sketchInput);

    const result = await writeFieldValues(user, table, sketchId);
    if (result.error) {
      throw new InputValidationError(result.error);
    }

    // Revalidate
    const revalidated = await revalidateSketchAndPeople(
      sketchId,
      resolved.castItems,
      resolved.creditItems,
    );

    return NextResponse.json({
      id: sketchId,
      url_slug: result.content?.newSlug || existing.url_slug,
      resolved: buildResolvedResponse(resolved),
      revalidated,
      search_refreshed: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
