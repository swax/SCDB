import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildPersonTableCms,
  preparePersonMappingReplacements,
} from "@/backend/api/personApiService";
import { getPerson } from "@/backend/content/personService";
import { findAndBuildTableCms } from "@/backend/edit/editReadService";
import { deleteRow, writeFieldValues } from "@/backend/edit/editWriteService";
import { PersonUpdateInputSchema } from "@/shared/schemas/person";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const personId = parseInt(id);

    if (isNaN(personId)) {
      throw new ApiError(400, "Invalid person ID");
    }

    const person = await getPerson(personId);

    if (!person) {
      throw new ApiError(404, "Person not found");
    }

    return NextResponse.json(person);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateApiRequest(request);

    const { id } = await params;
    const personId = parseInt(id);

    if (isNaN(personId)) {
      throw new ApiError(400, "Invalid person ID");
    }

    const existing = await getPerson(personId);
    if (!existing) {
      throw new ApiError(404, "Person not found");
    }

    const input = PersonUpdateInputSchema.parse(await request.json());
    const table = buildPersonTableCms(input, true);

    // If images array is provided, replace all existing person_image rows
    await preparePersonMappingReplacements(table, personId, input);

    const response = await writeFieldValues(user, table, personId);

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json({
      id: personId,
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
    const personId = parseInt(id);

    if (isNaN(personId)) {
      throw new ApiError(400, "Invalid person ID");
    }

    const table = findAndBuildTableCms("person");

    await deleteRow(user, table, personId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
