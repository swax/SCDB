import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { buildEntityTableCms } from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getCategoriesList } from "@/backend/content/categoryService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { CategoryInputSchema } from "@/shared/schemas/entities";
import { PaginationParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "categories",
        singular: "Category",
        plural: "Categories",
        createSchema: "CategoryInput",
        listSchema: "PaginationParams",
      });
    }

    const { search, page, pageSize, sortField, sortDir } =
      PaginationParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const result = await getCategoriesList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
    });
    return NextResponse.json({
      categories: result.list,
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
    const input = CategoryInputSchema.parse(await request.json());
    const table = buildEntityTableCms("category", input, false);
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
