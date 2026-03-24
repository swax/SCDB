import { NextResponse } from "next/server";

const API_PREFIX = "/api";

export function GET() {
  return NextResponse.json({
    _links: [
      { rel: "self", href: `${API_PREFIX}/`, title: "API Discovery" },
      {
        rel: "schemas",
        href: `${API_PREFIX}/schemas/`,
        title: "Schema Registry",
      },
      {
        rel: "sketches",
        href: `${API_PREFIX}/sketches`,
        title: "List/Create Sketches",
        methods: ["GET", "POST"],
      },
      {
        rel: "sketch",
        href: `${API_PREFIX}/sketches/{id}`,
        title: "Get/Update/Delete Sketch",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "lookup",
        href: `${API_PREFIX}/lookup/{table}?search={term}`,
        title:
          "Lookup entity IDs by name (tables: show, season, episode, person, character, tag, recurring_sketch, category)",
        methods: ["GET"],
      },
    ],
  });
}
