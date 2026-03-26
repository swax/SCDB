import { schemaRegistry } from "@/backend/api/schemaRegistry";
import { NextResponse } from "next/server";

/** Recursively resolve $ref strings against the schema registry */
function resolveRefs(obj: unknown, seen = new Set<string>()): unknown {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map((item) => resolveRefs(item, seen));

  const record = obj as Record<string, unknown>;

  // Replace { $ref: "SchemaName" } with the referenced schema (inline)
  if (typeof record.$ref === "string" && Object.keys(record).length === 1) {
    const refName = record.$ref;
    if (seen.has(refName)) return { type: "object", description: refName };
    const referenced = schemaRegistry[refName];
    if (referenced) {
      seen.add(refName);
      return resolveRefs(referenced, seen);
    }
  }

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    resolved[key] = resolveRefs(value, seen);
  }
  return resolved;
}

type RouteParams = { params: Promise<{ schemaName: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { schemaName } = await params;
  const schema = schemaRegistry[schemaName];

  if (!schema) {
    return NextResponse.json(
      {
        error: "Schema not found",
        schemaName,
        available: Object.keys(schemaRegistry),
      },
      { status: 404 },
    );
  }

  return NextResponse.json(resolveRefs(schema));
}
