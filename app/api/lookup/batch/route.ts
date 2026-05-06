import { handleApiError } from "@/backend/api/apiAuth";
import lookupTermsInTable from "@/backend/edit/lookupService";
import { BatchLookupInputSchema } from "@/shared/schemas/lookup";
import { NextRequest, NextResponse } from "next/server";

/** Per-table lookup configuration (table name + label column for the lookup service) */
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

const DEFAULT_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    const body = BatchLookupInputSchema.parse(await request.json());

    const results: Record<
      string,
      Record<string, { id: number; label: string }[]>
    > = {};

    for (const [tableName, terms] of Object.entries(body)) {
      if (!terms) continue;
      const config = lookupConfigs[tableName];
      results[tableName] = {};

      const lookups = terms.map(async (term) => {
        const response = await lookupTermsInTable(term, config, DEFAULT_LIMIT);
        results[tableName][term] = (response.content || []).map(
          (r: { id: number; label: string }) => ({ id: r.id, label: r.label }),
        );
      });

      await Promise.all(lookups);
    }

    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(error);
  }
}
