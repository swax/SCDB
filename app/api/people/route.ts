import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import {
  buildPersonTableCms,
  PersonInput,
} from "@/backend/api/personApiService";
import { getPersonList } from "@/backend/content/personService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
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
      });
    }

    const params = request.nextUrl.searchParams;

    const result = await getPersonList({
      search: params.get("search") || undefined,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
      sortField: params.get("sortField") || undefined,
      sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
    });

    return NextResponse.json({
      people: result.list,
      total: result.count,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);

    const input = (await request.json()) as PersonInput;

    if (!input.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!input.gender) {
      return NextResponse.json(
        { error: "gender is required (Male, Female, or Other)" },
        { status: 400 },
      );
    }

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
