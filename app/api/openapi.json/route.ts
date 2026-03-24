import { NextResponse } from "next/server";

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
    schemas: {
      Sketch: {
        type: "object",
        properties: {
          id: { type: "integer" },
          url_slug: { type: "string" },
          title: { type: "string" },
          teaser: { type: "string", nullable: true },
          synopsis: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          link_urls: {
            type: "array",
            items: { type: "string" },
            nullable: true,
          },
          site_rating: { type: "number", nullable: true },
          video_urls: { type: "array", items: { type: "string" } },
          show: {
            type: "object",
            properties: {
              id: { type: "integer" },
              url_slug: { type: "string" },
              title: { type: "string" },
            },
          },
          season: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              url_slug: { type: "string" },
              year: { type: "integer" },
              number: { type: "integer" },
            },
          },
          episode: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              url_slug: { type: "string" },
              number: { type: "integer" },
              air_date: { type: "string", format: "date-time" },
            },
          },
          recurring_sketch: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer" },
              url_slug: { type: "string" },
              title: { type: "string" },
            },
          },
          sketch_quotes: {
            type: "array",
            items: {
              type: "object",
              properties: { quote: { type: "string" } },
            },
          },
          sketch_tags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tag: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                    name: { type: "string" },
                    category: {
                      type: "object",
                      properties: { name: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          sketch_casts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                character_name: { type: "string", nullable: true },
                character: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    url_slug: { type: "string" },
                  },
                },
                person: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    url_slug: { type: "string" },
                  },
                },
                role: {
                  type: "string",
                  enum: ["Cast", "Guest", "Host", "Uncredited"],
                },
              },
            },
          },
          sketch_credits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                person: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    url_slug: { type: "string" },
                  },
                },
                role: {
                  type: "string",
                  enum: ["Writer", "Director", "Musician", "Other"],
                },
              },
            },
          },
        },
      },
      SketchListItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          url_slug: { type: "string" },
          site_rating: { type: "number", nullable: true },
          posted_on_socials: { type: "boolean" },
          review_status: {
            type: "string",
            enum: ["NeedsReview", "Flagged", "Reviewed"],
          },
          show: {
            type: "object",
            properties: { title: { type: "string" } },
          },
          season: {
            type: "object",
            nullable: true,
            properties: { year: { type: "integer" } },
          },
          created_at: { type: "string", format: "date-time" },
        },
      },
      SketchInput: {
        type: "object",
        required: ["title", "show_id"],
        properties: {
          title: { type: "string", description: "Sketch title" },
          show_id: {
            type: "integer",
            description: "ID of the show. Use GET /lookup/show to find IDs.",
          },
          season_id: {
            type: "integer",
            nullable: true,
            description:
              "ID of the season. Use GET /lookup/season to find IDs.",
          },
          episode_id: {
            type: "integer",
            nullable: true,
            description:
              "ID of the episode. Use GET /lookup/episode to find IDs.",
          },
          recurring_sketch_id: {
            type: "integer",
            nullable: true,
            description: "ID of the recurring sketch, if applicable.",
          },
          video_urls: {
            type: "array",
            items: { type: "string" },
            description:
              "Video URLs (YouTube, Vimeo, TikTok, Reddit, Facebook, Internet Archive)",
          },
          teaser: {
            type: "string",
            nullable: true,
            description: "Short teaser text",
          },
          synopsis: {
            type: "string",
            nullable: true,
            description: "Full synopsis of the sketch",
          },
          notes: {
            type: "string",
            nullable: true,
            description: "Additional notes",
          },
          link_urls: {
            type: "array",
            items: { type: "string" },
            nullable: true,
            description: "Related external links",
          },
          posted_on_socials: {
            type: "boolean",
            description: "Whether this has been posted on social media",
          },
          cast: {
            type: "array",
            description: "Cast members in the sketch",
            items: {
              type: "object",
              required: ["role"],
              properties: {
                character_name: {
                  type: "string",
                  nullable: true,
                  description: "Name of the character played",
                },
                character_id: {
                  type: "integer",
                  nullable: true,
                  description:
                    "ID of existing character page. Use GET /lookup/character to find IDs.",
                },
                person_id: {
                  type: "integer",
                  nullable: true,
                  description:
                    "ID of the actor. Use GET /lookup/person to find IDs.",
                },
                role: {
                  type: "string",
                  enum: ["Cast", "Guest", "Host", "Uncredited"],
                  description: "Role type",
                },
                minor_role: {
                  type: "boolean",
                  description: "Whether this is a minor/non-speaking role",
                },
              },
            },
          },
          credits: {
            type: "array",
            description: "Credits (writers, directors, etc.)",
            items: {
              type: "object",
              required: ["person_id", "role"],
              properties: {
                person_id: {
                  type: "integer",
                  description:
                    "ID of the person. Use GET /lookup/person to find IDs.",
                },
                role: {
                  type: "string",
                  enum: ["Writer", "Director", "Musician", "Other"],
                  description: "Credit role",
                },
                description: {
                  type: "string",
                  nullable: true,
                  description: "Additional description for the credit",
                },
              },
            },
          },
          quotes: {
            type: "array",
            description: "Memorable quotes from the sketch",
            items: {
              type: "object",
              required: ["quote"],
              properties: {
                quote: { type: "string", description: "The quote text" },
              },
            },
          },
          tags: {
            type: "array",
            description: "Tags for categorization",
            items: {
              type: "object",
              required: ["tag_id"],
              properties: {
                tag_id: {
                  type: "integer",
                  description:
                    "ID of the tag. Use GET /lookup/tag to find IDs.",
                },
              },
            },
          },
        },
      },
      SketchUpdateInput: {
        type: "object",
        description:
          "Same fields as SketchInput but all optional. Only provided fields are updated. " +
          "For array fields (cast, credits, quotes, tags), providing the array replaces all existing entries.",
        properties: {
          title: { type: "string" },
          show_id: { type: "integer" },
          season_id: { type: "integer", nullable: true },
          episode_id: { type: "integer", nullable: true },
          recurring_sketch_id: { type: "integer", nullable: true },
          video_urls: { type: "array", items: { type: "string" } },
          teaser: { type: "string", nullable: true },
          synopsis: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          link_urls: {
            type: "array",
            items: { type: "string" },
            nullable: true,
          },
          posted_on_socials: { type: "boolean" },
          cast: {
            type: "array",
            description: "Replaces all existing cast entries",
            items: {
              $ref: "#/components/schemas/SketchInput/properties/cast/items",
            },
          },
          credits: {
            type: "array",
            description: "Replaces all existing credit entries",
            items: {
              $ref: "#/components/schemas/SketchInput/properties/credits/items",
            },
          },
          quotes: {
            type: "array",
            description: "Replaces all existing quote entries",
            items: {
              $ref: "#/components/schemas/SketchInput/properties/quotes/items",
            },
          },
          tags: {
            type: "array",
            description: "Replaces all existing tag entries",
            items: {
              $ref: "#/components/schemas/SketchInput/properties/tags/items",
            },
          },
        },
      },
      Person: {
        type: "object",
        properties: {
          id: { type: "integer" },
          url_slug: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          birth_date: { type: "string", format: "date", nullable: true },
          death_date: { type: "string", format: "date", nullable: true },
          age: { type: "integer", nullable: true },
          link_urls: {
            type: "array",
            items: { type: "string" },
            nullable: true,
          },
          character: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                url_slug: { type: "string" },
                name: { type: "string" },
              },
            },
          },
          person_images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string", nullable: true },
                image: {
                  type: "object",
                  properties: {
                    cdn_key: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      PersonInput: { $ref: "#/components/schemas/Person" },
      PersonUpdateInput: { $ref: "#/components/schemas/Person" },
      PersonListItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          url_slug: { type: "string" },
          birth_date: { type: "string", format: "date", nullable: true },
          death_date: { type: "string", format: "date", nullable: true },
          age: { type: "integer", nullable: true },
          _count: {
            type: "object",
            properties: {
              sketch_casts: { type: "integer" },
            },
          },
        },
      },
      LookupResult: {
        type: "object",
        properties: {
          id: { type: "integer" },
          label: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        operationId: "apiDiscovery",
        summary: "API discovery root",
        description:
          "Returns HATEOAS-style links to all available API endpoints. " +
          "Start here to discover the API.",
        tags: ["Discovery"],
        security: [],
        responses: {
          "200": {
            description: "API discovery links",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    _links: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          rel: { type: "string" },
                          href: { type: "string" },
                          title: { type: "string" },
                          methods: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/schemas": {
      get: {
        operationId: "listSchemas",
        summary: "List available schemas",
        description:
          "Returns the names of all available JSON schemas. " +
          "Use GET /schemas/{name} to retrieve a specific schema definition.",
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
                    schemas: {
                      type: "array",
                      items: { type: "string" },
                    },
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
          "Returns the full JSON Schema definition for a specific schema. " +
          "Use this to understand request/response shapes without loading the entire OpenAPI spec.",
        tags: ["Discovery"],
        security: [],
        parameters: [
          {
            name: "schemaName",
            in: "path",
            required: true,
            description: "Name of the schema to retrieve",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "JSON Schema definition",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          "404": {
            description: "Schema not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/sketches": {
      get: {
        operationId: "listSketches",
        summary: "List sketches",
        description:
          "Returns a paginated list of sketches with basic info. Supports text search and sorting.",
        tags: ["Sketches"],
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Search sketches by title",
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
            description:
              "Field to sort by (e.g. title, site_rating, created_at)",
            schema: { type: "string" },
          },
          {
            name: "sortDir",
            in: "query",
            description: "Sort direction",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of sketches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sketches: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SketchListItem" },
                    },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createSketch",
        summary: "Create a new sketch",
        description:
          "Creates a new sketch entry. Use the lookup endpoints first to find IDs for show, season, episode, people, and tags.",
        tags: ["Sketches"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SketchInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Sketch created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/sketches/{id}": {
      get: {
        operationId: "getSketch",
        summary: "Get sketch details",
        description:
          "Returns full details for a sketch including cast, credits, quotes, and tags.",
        tags: ["Sketches"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Sketch details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Sketch" },
              },
            },
          },
          "404": {
            description: "Sketch not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        operationId: "updateSketch",
        summary: "Update a sketch",
        description:
          "Updates an existing sketch. Only include fields you want to change. " +
          "For array fields (cast, credits, quotes, tags), providing the array replaces ALL existing entries.",
        tags: ["Sketches"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SketchUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Sketch updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Sketch not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deleteSketch",
        summary: "Delete a sketch",
        description:
          "Permanently deletes a sketch and all its associated data (cast, credits, quotes, tags).",
        tags: ["Sketches"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Sketch deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Sketch not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/people": {
      get: {
        operationId: "listPeople",
        summary: "List people",
        description:
          "Returns a paginated list of people (actors, writers, etc.) with basic info.",
        tags: ["People"],
        parameters: [
          {
            name: "search",
            in: "query",
            description: "Search people by name",
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
            description: "Field to sort by (e.g. name, birth_date)",
            schema: { type: "string" },
          },
          {
            name: "sortDir",
            in: "query",
            description: "Sort direction",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of people",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    people: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PersonListItem" },
                    },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    pageSize: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        operationId: "createPerson",
        summary: "Create a new person",
        description: "Creates a new person entry (actor, writer, etc.).",
        tags: ["People"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PersonInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Person created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/people/{id}": {
      get: {
        operationId: "getPerson",
        summary: "Get person details",
        description:
          "Returns full details for a person including images, characters, and links.",
        tags: ["People"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Person details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Person" },
              },
            },
          },
          "404": {
            description: "Person not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        operationId: "updatePerson",
        summary: "Update a person",
        description:
          "Updates an existing person. Only include fields you want to change.",
        tags: ["People"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PersonUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Person updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "Person not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        operationId: "deletePerson",
        summary: "Delete a person",
        description: "Permanently deletes a person entry.",
        tags: ["People"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Person deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Person not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/lookup/{table}": {
      get: {
        operationId: "lookupValues",
        summary: "Search for entity IDs by name",
        description:
          "Search for shows, people, tags, and other entities by name to get their IDs. " +
          "Use these IDs when creating or updating sketches. " +
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
              "Search term. Matches are case-insensitive and support multiple space-separated terms.",
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
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  "x-tagGroups": [
    {
      name: "Discovery",
      tags: ["Discovery", "Lookup"],
    },
    {
      name: "Content",
      tags: ["Sketches", "People"],
    },
  ],
};

export function GET() {
  return NextResponse.json(spec);
}
