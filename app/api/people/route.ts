import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { buildPersonTableCms } from "@/backend/api/personApiService";
import { getPersonList } from "@/backend/content/personService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { PaginationParamsSchema } from "@/shared/schemas/listParams";
import { PersonInputSchema } from "@/shared/schemas/person";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "people",
        singular: "Person",
        plural: "People",
        createSchema: "PersonInput",
        updateSchema: "PersonUpdateInput",
        listSchema: "PaginationParams",
        extraActions: [
          {
            rel: "add-images",
            href: "/api/people/{id}/images",
            method: "POST",
            title:
              "Append portrait images to a person. Body accepts a single " +
              "PersonImageInput or a non-empty array. Upload images first " +
              "via POST /upload-image/direct.",
            schema: "PersonImagesAppendInput",
          },
        ],
      });
    }

    const { search, page, pageSize, sortField, sortDir } =
      PaginationParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const result = await getPersonList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
    });

    return NextResponse.json({
      people: result.list,
      total: result.count,
      page,
      pageSize,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);

    const input = PersonInputSchema.parse(await request.json());

    const table = buildPersonTableCms(input, false);

    const response = await writeFieldValues(user, table, 0);

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        id: response.content?.rowId,
        url_slug: response.content?.newSlug,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
