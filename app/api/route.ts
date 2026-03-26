import { NextResponse } from "next/server";

const API_PREFIX = "/api";

export function GET() {
  return NextResponse.json({
    _links: [
      { rel: "self", href: `${API_PREFIX}/`, title: "API Discovery" },
      {
        rel: "schemas",
        href: `${API_PREFIX}/schemas/`,
        title:
          "Schema Registry — individual schemas with $ref resolved inline",
      },
      { rel: "shows", href: `${API_PREFIX}/shows`, title: "Shows" },
      { rel: "seasons", href: `${API_PREFIX}/seasons`, title: "Seasons" },
      { rel: "episodes", href: `${API_PREFIX}/episodes`, title: "Episodes" },
      { rel: "sketches", href: `${API_PREFIX}/sketches`, title: "Sketches" },
      {
        rel: "recurring-sketches",
        href: `${API_PREFIX}/recurring-sketches`,
        title: "Recurring Sketches",
      },
      { rel: "people", href: `${API_PREFIX}/people`, title: "People" },
      {
        rel: "characters",
        href: `${API_PREFIX}/characters`,
        title: "Characters",
      },
      {
        rel: "categories",
        href: `${API_PREFIX}/categories`,
        title: "Categories",
      },
      { rel: "tags", href: `${API_PREFIX}/tags`, title: "Tags" },
      { rel: "checklist", href: `${API_PREFIX}/checklist`, title: "Checklist" },
      {
        rel: "lookup",
        href: `${API_PREFIX}/lookup/{table}?search={term}`,
        title:
          "Lookup entity IDs by name (tables: show, season, episode, person, character, tag, recurring_sketch, category)",
      },
      {
        rel: "upload-image",
        href: `${API_PREFIX}/upload-image`,
        title: "Image upload workflow",
      },
      {
        rel: "revalidate",
        href: `${API_PREFIX}/revalidate/{table}/{id}`,
        title:
          "Revalidate cached page for an entity (tables: shows, seasons, episodes, sketches, recurring-sketches, people, characters, categories, tags)",
      },
      {
        rel: "refresh-search",
        href: `${API_PREFIX}/refresh-search`,
        title: "Refresh the sketch full-text search index",
      },
    ],
  });
}
