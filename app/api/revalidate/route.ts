import {
  authenticateApiRequest,
  ApiError,
  handleApiError,
} from "@/backend/api/apiAuth";
import { revalidateEntityById } from "@/backend/api/entityApiService";
import prisma from "@/database/prisma";
import { getSingularTableName } from "@/shared/tableNames";
import { NextRequest, NextResponse } from "next/server";

const API_PREFIX = "/api";

export function GET() {
  return NextResponse.json({
    _actions: [
      {
        rel: "batch",
        href: `${API_PREFIX}/revalidate`,
        method: "POST",
        title:
          "Revalidate multiple entities and optionally refresh search in one call",
        schema: `${API_PREFIX}/schemas/BatchRevalidateInput`,
      },
      {
        rel: "single",
        href: `${API_PREFIX}/revalidate/{table}/{id}`,
        method: "POST",
        title:
          "Revalidate a single entity (tables: shows, seasons, episodes, sketches, recurring-sketches, people, characters, categories, tags)",
      },
    ],
  });
}

interface BatchEntry {
  table: string;
  id: number;
}

export async function POST(request: NextRequest) {
  try {
    await authenticateApiRequest(request);

    const input = (await request.json()) as {
      entities?: BatchEntry[];
      refresh_search?: boolean;
    };

    if (!input.entities?.length && !input.refresh_search) {
      throw new ApiError(
        400,
        "Provide at least one of: entities (array), refresh_search (boolean)",
      );
    }

    const results: { table: string; id: number; success: boolean; error?: string }[] = [];

    if (input.entities) {
      for (const entry of input.entities) {
        const table = getSingularTableName(entry.table);
        if (!table) {
          results.push({
            table: entry.table,
            id: entry.id,
            success: false,
            error: `Unknown resource type: ${entry.table}`,
          });
          continue;
        }
        try {
          await revalidateEntityById(table, entry.id);
          results.push({ table: entry.table, id: entry.id, success: true });
        } catch (err) {
          results.push({
            table: entry.table,
            id: entry.id,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    if (input.refresh_search) {
      await prisma.$executeRaw`SELECT refresh_sketch_search()`;
    }

    return NextResponse.json({
      success: true,
      revalidated: results,
      search_refreshed: input.refresh_search ?? false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
