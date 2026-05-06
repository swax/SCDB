import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { buildEntityTableCms } from "@/backend/api/entityApiService";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getCharacterList } from "@/backend/content/characterService";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import { CharacterInputSchema } from "@/shared/schemas/entities";
import { PaginationParamsSchema } from "@/shared/schemas/listParams";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "characters",
        singular: "Character",
        plural: "Characters",
        createSchema: "CharacterInput",
        listSchema: "PaginationParams",
      });
    }

    const { search, page, pageSize, sortField, sortDir } =
      PaginationParamsSchema.parse(
        Object.fromEntries(request.nextUrl.searchParams),
      );

    const result = await getCharacterList({
      search,
      page,
      pageSize,
      sortField,
      sortDir,
    });
    return NextResponse.json({
      characters: result.list,
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
    const input = CharacterInputSchema.parse(await request.json());
    const table = buildEntityTableCms("character", input, false);
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
