import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import { revalidateEntityById } from "@/backend/api/entityApiService";
import prisma from "@/database/prisma";
import { BatchRevalidateInputSchema } from "@/shared/schemas/revalidate";
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

export async function POST(request: NextRequest) {
  try {
    await authenticateApiRequest(request);

    const input = BatchRevalidateInputSchema.parse(await request.json());
    const entities = "entities" in input ? input.entities : undefined;
    const refreshSearch = input.refresh_search ?? false;

    const results: {
      table: string;
      id: number;
      success: boolean;
      error?: string;
    }[] = [];

    if (entities) {
      for (const entry of entities) {
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

    if (refreshSearch) {
      await prisma.$executeRaw`SELECT refresh_sketch_search()`;
    }

    return NextResponse.json({
      success: true,
      revalidated: results,
      search_refreshed: refreshSearch,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
