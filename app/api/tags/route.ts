import {
  authenticateApiRequest,
  conflictIfExists,
  handleApiError,
} from "@/backend/api/apiAuth";
import {
  buildEntityTableCms,
  resolveLookupSlugField,
  resolveTagLookupSlug,
} from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getAllTagsList } from "@/backend/content/tagService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { TagListParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "tags",
        singular: "Tag",
        plural: "Tags",
        createSchema: "TagInput",
        listSchema: "TagListParams",
      });
    }

    const { search, page, pageSize, sortField, sortDir, category_id } =
      TagListParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const extraWhere: Record<string, number> = {};
    if (category_id !== undefined) extraWhere.category_id = category_id;

    const result = await getAllTagsList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
      extraWhere,
    });
    return NextResponse.json({
      tags: result.list,
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
    const input = (await request.json()) as Record<string, unknown>;
    if (!input.name)
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    if (!input.category_id)
      return NextResponse.json(
        { error: "category_id is required" },
        { status: 400 },
      );
    const conflict = await conflictIfExists(
      "tag",
      { category_id: input.category_id, name: input.name },
      "Tag",
    );
    if (conflict) return conflict;
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
