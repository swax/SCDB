import { ApiError, handleApiError } from "@/backend/api/apiAuth";
import lookupTermsInTable from "@/backend/edit/lookupService";
import { NextRequest, NextResponse } from "next/server";

/** Maps API table names to the lookup config used by the existing lookup service */
const lookupConfigs: Record<string, { table: string; labelColumn: string }> = {
  show: { table: "show", labelColumn: "title" },
  season: { table: "season", labelColumn: "lookup_slug" },
  episode: { table: "episode", labelColumn: "lookup_slug" },
  person: { table: "person", labelColumn: "name" },
  character: { table: "character", labelColumn: "name" },
  tag: { table: "tag", labelColumn: "lookup_slug" },
  recurring_sketch: { table: "recurring_sketch", labelColumn: "lookup_slug" },
  category: { table: "category", labelColumn: "name" },
};

const MAX_TERMS_PER_TABLE = 20;
const MAX_TABLES = Object.keys(lookupConfigs).length;
const DEFAULT_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError(
        400,
        `Request body must be an object with table names as keys and arrays of search terms as values. Valid tables: ${Object.keys(lookupConfigs).join(", ")}`,
      );
    }

    const tableNames = Object.keys(body);
    if (tableNames.length === 0) {
      throw new ApiError(400, "Request body must contain at least one table");
    }
    if (tableNames.length > MAX_TABLES) {
      throw new ApiError(400, `Maximum ${MAX_TABLES} tables per batch request`);
    }

    const results: Record<
      string,
      Record<string, { id: number; label: string }[]>
    > = {};

    for (const tableName of tableNames) {
      const config = lookupConfigs[tableName];
      if (!config) {
        throw new ApiError(
          400,
          `Unknown table: ${tableName}. Valid tables: ${Object.keys(lookupConfigs).join(", ")}`,
        );
      }

      const terms = body[tableName];
      if (!Array.isArray(terms)) {
        throw new ApiError(
          400,
          `Value for "${tableName}" must be an array of search terms`,
        );
      }
      if (terms.length > MAX_TERMS_PER_TABLE) {
        throw new ApiError(
          400,
          `Maximum ${MAX_TERMS_PER_TABLE} search terms per table (got ${terms.length} for "${tableName}")`,
        );
      }

      results[tableName] = {};

      const lookups = terms.map(async (term: unknown) => {
        if (typeof term !== "string" || !term.trim()) return;
        const searchTerm = term.trim();
        const response = await lookupTermsInTable(
          searchTerm,
          config,
          DEFAULT_LIMIT,
        );
        results[tableName][searchTerm] = (response.content || []).map(
          (r: { id: number; label: string }) => ({
            id: r.id,
            label: r.label,
          }),
        );
      });

      await Promise.all(lookups);
    }

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error);
  }
}
