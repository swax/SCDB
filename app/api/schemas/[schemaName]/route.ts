import {
  schemaRegistry,
  resolveSchemaRefs,
} from "@/backend/api/schemaRegistry";
import { NextResponse } from "next/server";

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

  return NextResponse.json(resolveSchemaRefs(schema));
}
