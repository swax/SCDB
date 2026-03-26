import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { checklist_status_type } from "@/shared/enums";
import {
  isDiscoveryRequest,
  collectionDiscoveryResponse,
} from "@/backend/api/hateoasDiscovery";
import { getChecklistList } from "@/backend/content/checklistService";
import prisma from "@/database/prisma";
import { getDefaultPageListSize } from "@/shared/ProcessEnv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (isDiscoveryRequest(request)) {
      return collectionDiscoveryResponse({
        path: "checklist",
        singular: "Checklist Item",
        plural: "Checklist Items",
        createSchema: "ChecklistInput",
        listSchema: "ChecklistPaginationParams",
      });
    }

    const params = request.nextUrl.searchParams;
    const status = params.get("status") || undefined;
    const result = await getChecklistList(
      {
        search: params.get("search") || undefined,
        page: parseInt(params.get("page") || "1"),
        pageSize: parseInt(
          params.get("pageSize") || String(getDefaultPageListSize()),
        ),
        sortField: params.get("sortField") || undefined,
        sortDir: (params.get("sortDir") as "asc" | "desc") || undefined,
      },
      status,
    );
    const page = parseInt(params.get("page") || "1");
    const pageSize = parseInt(
      params.get("pageSize") || String(getDefaultPageListSize()),
    );
    return NextResponse.json({
      checklist: result.list,
      total: result.count,
      page,
      pageSize,
      _links: [
        { rel: "self", href: "/api/checklist" },
        {
          rel: "schema",
          href: "/api/schemas/ChecklistInput",
          title: "Schema for creating/updating checklist items",
        },
      ],
      _filters: {
        status: {
          description: "Filter by checklist item status",
          values: ["Pending", "Added", "NotFound"],
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateApiRequest(request);
    const input = (await request.json()) as {
      show_id?: number;
      season_id?: number;
      episode_id?: number;
      sketch_title?: string;
      status?: checklist_status_type;
      video_url?: string;
      sketch_id?: number;
    };

    if (!input.show_id) {
      return NextResponse.json(
        { error: "show_id is required" },
        { status: 400 },
      );
    }
    if (!input.sketch_title) {
      return NextResponse.json(
        { error: "sketch_title is required" },
        { status: 400 },
      );
    }

    const item = await prisma.checklist.create({
      data: {
        show_id: input.show_id,
        season_id: input.season_id ?? null,
        episode_id: input.episode_id ?? null,
        sketch_title: input.sketch_title,
        status: input.status ?? checklist_status_type.Pending,
        video_url: input.video_url ?? null,
        sketch_id: input.sketch_id ?? null,
        created_by_id: user.id,
        modified_by_id: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: item.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
