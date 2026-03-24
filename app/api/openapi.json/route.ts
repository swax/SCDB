import { schemaRegistry } from "@/backend/api/schemaRegistry";
import { NextResponse } from "next/server";

// --- Helpers to generate repetitive CRUD path definitions ---

const paginationParams = [
  {
    name: "search",
    in: "query",
    description: "Search by name/title",
    schema: { type: "string" },
  },
  {
    name: "page",
    in: "query",
    description: "Page number (default: 1)",
    schema: { type: "integer", default: 1 },
  },
  {
    name: "pageSize",
    in: "query",
    description: "Results per page (default: 30)",
    schema: { type: "integer", default: 30 },
  },
  {
    name: "sortField",
    in: "query",
    description: "Field to sort by",
    schema: { type: "string" },
  },
  {
    name: "sortDir",
    in: "query",
    description: "Sort direction",
    schema: { type: "string", enum: ["asc", "desc"] },
  },
];

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer" },
};
const idSlugResponse = {
  type: "object",
  properties: { id: { type: "integer" }, url_slug: { type: "string" } },
};
const successResponse = {
  type: "object",
  properties: { success: { type: "boolean" } },
};
const errorRef = { $ref: "#/components/schemas/Error" };

function crudPaths(cfg: {
  path: string;
  tag: string;
  singular: string;
  plural: string;
  listKey: string;
  inputSchema: string;
  updateSchema?: string;
}) {
  const updateSchema = cfg.updateSchema || cfg.inputSchema;
  return {
    [`/${cfg.path}`]: {
      get: {
        operationId: `list${cfg.plural}`,
        summary: `List ${cfg.plural.toLowerCase()}`,
        tags: [cfg.tag],
        parameters: paginationParams,
        responses: {
          "200": {
            description: `Paginated list of ${cfg.plural.toLowerCase()}`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    [cfg.listKey]: { type: "array", items: { type: "object" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: `create${cfg.singular}`,
        summary: `Create a new ${cfg.singular.toLowerCase()}`,
        tags: [cfg.tag],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${cfg.inputSchema}` },
            },
          },
        },
        responses: {
          "201": {
            description: `${cfg.singular} created`,
            content: { "application/json": { schema: idSlugResponse } },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
    [`/${cfg.path}/{id}`]: {
      get: {
        operationId: `get${cfg.singular}`,
        summary: `Get ${cfg.singular.toLowerCase()} details`,
        tags: [cfg.tag],
        parameters: [idParam],
        responses: {
          "200": {
            description: `${cfg.singular} details`,
            content: { "application/json": { schema: { type: "object" } } },
          },
          "404": {
            description: `${cfg.singular} not found`,
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
      put: {
        operationId: `update${cfg.singular}`,
        summary: `Update a ${cfg.singular.toLowerCase()}`,
        description: "Only include fields you want to change.",
        tags: [cfg.tag],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${updateSchema}` },
            },
          },
        },
        responses: {
          "200": {
            description: `${cfg.singular} updated`,
            content: { "application/json": { schema: idSlugResponse } },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
          "404": {
            description: `${cfg.singular} not found`,
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
      delete: {
        operationId: `delete${cfg.singular}`,
        summary: `Delete a ${cfg.singular.toLowerCase()}`,
        tags: [cfg.tag],
        parameters: [idParam],
        responses: {
          "200": {
            description: `${cfg.singular} deleted`,
            content: { "application/json": { schema: successResponse } },
          },
          "404": {
            description: `${cfg.singular} not found`,
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
  };
}

// --- Build spec ---

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Sketch Comedy Database API",
    description:
      "REST API for managing sketch comedy content on SketchTV.lol. " +
      "Use the lookup endpoints to discover IDs for shows, people, tags, etc. before creating or updating sketches.",
    version: "1.0.0",
  },
  servers: [{ url: "/api" }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "API key passed as a Bearer token",
      },
    },
    // Expose the schema registry directly so Scalar can render them
    schemas: {
      ...schemaRegistry,
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    // Discovery
    "/": {
      get: {
        operationId: "apiDiscovery",
        summary: "API discovery root",
        description:
          "Returns HATEOAS-style links to all available API endpoints.",
        tags: ["Discovery"],
        security: [],
        responses: {
          "200": {
            description: "API discovery links",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/schemas": {
      get: {
        operationId: "listSchemas",
        summary: "List available schemas",
        description: "Returns the names of all available JSON schemas.",
        tags: ["Discovery"],
        security: [],
        responses: {
          "200": {
            description: "List of schema names",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    schemas: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/schemas/{schemaName}": {
      get: {
        operationId: "getSchema",
        summary: "Get a JSON schema by name",
        description:
          "Returns the full JSON Schema definition for a specific schema.",
        tags: ["Discovery"],
        security: [],
        parameters: [
          {
            name: "schemaName",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "JSON Schema definition",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "404": {
            description: "Schema not found",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },

    // Content CRUD
    ...crudPaths({
      path: "shows",
      tag: "Shows",
      singular: "Show",
      plural: "Shows",
      listKey: "shows",
      inputSchema: "ShowInput",
    }),
    ...crudPaths({
      path: "seasons",
      tag: "Seasons",
      singular: "Season",
      plural: "Seasons",
      listKey: "seasons",
      inputSchema: "SeasonInput",
    }),
    ...crudPaths({
      path: "episodes",
      tag: "Episodes",
      singular: "Episode",
      plural: "Episodes",
      listKey: "episodes",
      inputSchema: "EpisodeInput",
    }),
    ...crudPaths({
      path: "sketches",
      tag: "Sketches",
      singular: "Sketch",
      plural: "Sketches",
      listKey: "sketches",
      inputSchema: "SketchInput",
      updateSchema: "SketchUpdateInput",
    }),
    ...crudPaths({
      path: "recurring-sketches",
      tag: "Recurring Sketches",
      singular: "RecurringSketch",
      plural: "RecurringSketches",
      listKey: "recurring_sketches",
      inputSchema: "RecurringSketchInput",
    }),
    ...crudPaths({
      path: "people",
      tag: "People",
      singular: "Person",
      plural: "People",
      listKey: "people",
      inputSchema: "PersonInput",
      updateSchema: "PersonUpdateInput",
    }),
    ...crudPaths({
      path: "characters",
      tag: "Characters",
      singular: "Character",
      plural: "Characters",
      listKey: "characters",
      inputSchema: "CharacterInput",
    }),
    ...crudPaths({
      path: "categories",
      tag: "Categories",
      singular: "Category",
      plural: "Categories",
      listKey: "categories",
      inputSchema: "CategoryInput",
    }),
    ...crudPaths({
      path: "tags",
      tag: "Tags",
      singular: "Tag",
      plural: "Tags",
      listKey: "tags",
      inputSchema: "TagInput",
    }),

    // Lookup
    "/lookup/{table}": {
      get: {
        operationId: "lookupValues",
        summary: "Search for entity IDs by name",
        description:
          "Search for shows, people, tags, and other entities by name to get their IDs. " +
          "Supported tables: show, season, episode, person, character, tag, recurring_sketch, category.",
        tags: ["Lookup"],
        parameters: [
          {
            name: "table",
            in: "path",
            required: true,
            description: "The entity type to search",
            schema: {
              type: "string",
              enum: [
                "show",
                "season",
                "episode",
                "person",
                "character",
                "tag",
                "recurring_sketch",
                "category",
              ],
            },
          },
          {
            name: "search",
            in: "query",
            required: true,
            description:
              "Search term (case-insensitive, supports multiple space-separated terms)",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Matching entities",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/LookupResult" },
                },
              },
            },
          },
          "400": {
            description: "Invalid table or missing search parameter",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
  },
  "x-tagGroups": [
    { name: "Discovery", tags: ["Discovery", "Lookup"] },
    {
      name: "Content",
      tags: [
        "Shows",
        "Seasons",
        "Episodes",
        "Sketches",
        "Recurring Sketches",
        "People",
        "Characters",
        "Categories",
        "Tags",
      ],
    },
  ],
};

export function GET() {
  return NextResponse.json(spec);
}
