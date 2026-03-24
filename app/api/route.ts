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
        rel: "shows",
        href: `${API_PREFIX}/shows`,
        title: "List/Create Shows",
        methods: ["GET", "POST"],
      },
      {
        rel: "show",
        href: `${API_PREFIX}/shows/{id}`,
        title: "Get/Update/Delete Show",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "seasons",
        href: `${API_PREFIX}/seasons`,
        title: "List/Create Seasons",
        methods: ["GET", "POST"],
      },
      {
        rel: "season",
        href: `${API_PREFIX}/seasons/{id}`,
        title: "Get/Update/Delete Season",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "episodes",
        href: `${API_PREFIX}/episodes`,
        title: "List/Create Episodes",
        methods: ["GET", "POST"],
      },
      {
        rel: "episode",
        href: `${API_PREFIX}/episodes/{id}`,
        title: "Get/Update/Delete Episode",
        methods: ["GET", "PUT", "DELETE"],
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
        rel: "recurring-sketches",
        href: `${API_PREFIX}/recurring-sketches`,
        title: "List/Create Recurring Sketches",
        methods: ["GET", "POST"],
      },
      {
        rel: "recurring-sketch",
        href: `${API_PREFIX}/recurring-sketches/{id}`,
        title: "Get/Update/Delete Recurring Sketch",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "people",
        href: `${API_PREFIX}/people`,
        title: "List/Create People",
        methods: ["GET", "POST"],
      },
      {
        rel: "person",
        href: `${API_PREFIX}/people/{id}`,
        title: "Get/Update/Delete Person",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "characters",
        href: `${API_PREFIX}/characters`,
        title: "List/Create Characters",
        methods: ["GET", "POST"],
      },
      {
        rel: "character",
        href: `${API_PREFIX}/characters/{id}`,
        title: "Get/Update/Delete Character",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "categories",
        href: `${API_PREFIX}/categories`,
        title: "List/Create Categories",
        methods: ["GET", "POST"],
      },
      {
        rel: "category",
        href: `${API_PREFIX}/categories/{id}`,
        title: "Get/Update/Delete Category",
        methods: ["GET", "PUT", "DELETE"],
      },
      {
        rel: "tags",
        href: `${API_PREFIX}/tags`,
        title: "List/Create Tags",
        methods: ["GET", "POST"],
      },
      {
        rel: "tag",
        href: `${API_PREFIX}/tags/{id}`,
        title: "Get/Update/Delete Tag",
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
