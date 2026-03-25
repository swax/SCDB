import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { buildEntityTableCms, resolveLookupSlugField, resolveTagLookupSlug } from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getAllTagsList } from "@/backend/content/tagService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "tags",
        singular: "Tag",
        plural: "Tags",
        createSchema: "TagInput",
      });
    }

    const params = request.nextUrl.searchParams;
    const result = await getAllTagsList({
      search: params.get("search") || undefined,
      page: parseInt(params.get("page") || "1"),
      pageSize: parseInt(
        params.get("pageSize") || String(getDefaultPageListSize()),
      ),
      sortField: params.get("sortField") || undefined,
      sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
    });
    return NextResponse.json({
      tags: result.list,
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
    const input = await request.json();
    if (!input.name)
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!input.category_id)
      return NextResponse.json(
        { error: "category_id is required" },
        { status: 400 },
      );
    const table = buildEntityTableCms("tag", input, false);
    await resolveLookupSlugField(table, input, () =>
      resolveTagLookupSlug(input),
    );
    const response = await writeFieldValues(user, table, 0);
    if (response.error)
      return NextResponse.json({ error: response.error }, { status: 400 });
    return NextResponse.json(
      { id: response.content?.rowId, url_slug: response.content?.newSlug },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
