import { NextResponse } from "next/server";

const API_PREFIX = "/api";

export function GET() {
  return NextResponse.json({
    _links: [
      { rel: "self", href: `${API_PREFIX}/`, title: "API Discovery" },
      {
        rel: "schemas",
        href: `${API_PREFIX}/schemas/`,
        title: "Schema Registry — individual schemas with $ref resolved inline",
      },
      { rel: "shows", href: `${API_PREFIX}/shows`, title: "Shows" },
      { rel: "seasons", href: `${API_PREFIX}/seasons`, title: "Seasons" },
      { rel: "episodes", href: `${API_PREFIX}/episodes`, title: "Episodes" },
      {
        rel: "sketches",
        href: `${API_PREFIX}/sketches`,
        title:
          "Sketches — list/read/delete. To CREATE or UPDATE, prefer /api/sketches/full instead.",
      },
      {
        rel: "sketches-full",
        href: `${API_PREFIX}/sketches/full`,
        title:
          "RECOMMENDED for sketch create/update. Uses names (not IDs) — resolves lookups, " +
          "creates seasons/episodes, assign images by ID, revalidates, refreshes search. " +
          "POST to create, PUT /{id} to update. GET for schema + example.",
      },
      {
        rel: "sketches-flagged",
        href: `${API_PREFIX}/sketches/flagged`,
        title:
          "Sketches currently flagged for review. GET returns {sketches, total}; follow _linkTemplates to mark as Reprocessing.",
      },
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
        rel: "checklist-suggest",
        href: `${API_PREFIX}/checklist/suggest`,
        title:
          "Survey agent entry point — returns one sparse {show_id, show_title, season_number} to research next.",
      },
      {
        rel: "lookup",
        href: `${API_PREFIX}/lookup/{table}?search={term}&limit={n}`,
        title:
          "Lookup entity IDs by name (tables: show, season, episode, person, character, tag, recurring_sketch, category). Limit defaults to 10, max 100.",
      },
      {
        rel: "lookup-batch",
        href: `${API_PREFIX}/lookup/batch`,
        title:
          "POST — batch lookup across multiple tables/terms in one call. Body: {table: [terms]}. See BatchLookupInput schema.",
      },
      {
        rel: "upload-image",
        href: `${API_PREFIX}/upload-image`,
        title: "Image upload workflow",
      },
      {
        rel: "revalidate",
        href: `${API_PREFIX}/revalidate`,
        title:
          "Revalidate cached pages — supports single and batch.",
      },
      {
        rel: "refresh-search",
        href: `${API_PREFIX}/refresh-search`,
        title: "POST — Rebuild the sketch full-text search index.",
      },
    ],
  });
}
