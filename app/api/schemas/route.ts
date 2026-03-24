import { schemaRegistry } from "@/backend/api/schemaRegistry";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    schemas: Object.keys(schemaRegistry),
  });
}
