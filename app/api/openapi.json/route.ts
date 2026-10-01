import {
  resolveSchemaRefs,
  schemaRegistry,
} from "@/backend/api/schemaRegistry";
import { NextResponse } from "next/server";

// --- Helpers to generate repetitive CRUD path definitions ---

// Reuse the runtime query schemas so filters, bounds, and defaults stay in sync.
function queryParameters(schemaName: string) {
  const schema = resolveSchemaRefs(schemaRegistry[schemaName]) as {
    properties: Record<string, { description?: string }>;
  };
  return Object.entries(schema.properties).map(([name, property]) => ({
    name,
    in: "query",
    required: false,
    description: property.description,
    schema: property,
  }));
}

const collectionDescription =
  "With no query parameters, returns HATEOAS discovery actions and schema links. " +
  "Include at least one query parameter (for example ?page=1) to return a paginated list.";

const discoverySchema = {
  type: "object",
  required: ["_actions"],
  properties: {
    _actions: {
      type: "array",
      items: { $ref: "#/components/schemas/HateoasAction" },
    },
    _links: {
      type: "array",
      items: { $ref: "#/components/schemas/HateoasLink" },
    },
  },
};

function collectionResponse(listKey: string) {
  return {
    oneOf: [
      discoverySchema,
      {
        type: "object",
        required: [listKey, "total", "page", "pageSize"],
        properties: {
          [listKey]: { type: "array", items: { type: "object" } },
          total: { type: "integer" },
          page: { type: "integer" },
          pageSize: { type: "integer" },
        },
      },
    ],
  };
}

function jsonResponse(description: string, schema: object) {
  return { description, content: { "application/json": { schema } } };
}

function jsonBody(schemaName: string) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

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
  listSchema?: string;
}) {
  const updateSchema = cfg.updateSchema || cfg.inputSchema;
  return {
    [`/${cfg.path}`]: {
      get: {
        operationId: `list${cfg.plural}`,
        summary: `List ${cfg.plural.toLowerCase()}`,
        description: collectionDescription,
        tags: [cfg.tag],
        security: [],
        parameters: queryParameters(cfg.listSchema ?? "PaginationParams"),
        responses: {
          "200": {
            description: `Discovery actions or paginated list of ${cfg.plural.toLowerCase()}`,
            content: {
              "application/json": {
                schema: collectionResponse(cfg.listKey),
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
        security: [],
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
      "Use the lookup endpoints to discover IDs for shows, people, tags, etc. before creating or updating sketches. " +
      collectionDescription,
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
      listSchema: "SeasonListParams",
    }),
    ...crudPaths({
      path: "episodes",
      tag: "Episodes",
      singular: "Episode",
      plural: "Episodes",
      listKey: "episodes",
      inputSchema: "EpisodeInput",
      listSchema: "EpisodeListParams",
    }),
    ...crudPaths({
      path: "sketches",
      tag: "Sketches",
      singular: "Sketch",
      plural: "Sketches",
      listKey: "sketches",
      inputSchema: "SketchInput",
      updateSchema: "SketchUpdateInput",
      listSchema: "SketchListParams",
    }),
    ...crudPaths({
      path: "recurring-sketches",
      tag: "Recurring Sketches",
      singular: "RecurringSketch",
      plural: "RecurringSketches",
      listKey: "recurring_sketches",
      inputSchema: "RecurringSketchInput",
      listSchema: "RecurringSketchListParams",
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
      listSchema: "TagListParams",
    }),

    // Checklist
    "/checklist": {
      get: {
        operationId: "listChecklist",
        summary: "List checklist items",
        description: collectionDescription,
        tags: ["Checklist"],
        security: [],
        parameters: queryParameters("ChecklistPaginationParams"),
        responses: {
          "200": {
            description:
              "Discovery actions or paginated list of checklist items",
            content: {
              "application/json": {
                schema: collectionResponse("checklist"),
              },
            },
          },
        },
      },
      post: {
        operationId: "createChecklistItem",
        summary: "Create a new checklist item",
        tags: ["Checklist"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChecklistInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Checklist item created",
            content: {
              "application/json": { schema: idSlugResponse },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
    "/checklist/bulk": {
      post: {
        operationId: "bulkCreateChecklistItems",
        summary: "Create up to 100 checklist items in one call",
        description:
          "Inserts an array of checklist items. Returns the inserted IDs in input order. " +
          "Use this when a survey agent has discovered many sketches in one season.",
        tags: ["Checklist"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChecklistBulkInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Checklist items created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChecklistBulkResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
    "/checklist/backsync": {
      post: {
        operationId: "backsyncChecklist",
        summary: "Reconcile checklist with sketches",
        description:
          "Inserts a checklist row (status=Added) for any sketch missing one, " +
          "and updates rows whose linked sketch's title/season/episode have " +
          "drifted. Use as a safety net — sketch creation auto-syncs.",
        tags: ["Checklist"],
        responses: {
          "200": {
            description: "Reconciliation counts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChecklistBacksyncResponse",
                },
              },
            },
          },
        },
      },
    },
    "/checklist/suggest": {
      get: {
        operationId: "suggestChecklistTarget",
        summary: "Suggest a sparse show/season for the survey agent",
        description:
          "Returns one randomly selected (show, season) pair that has 5 or fewer " +
          "checklist items, drawn from a hardcoded list of targeted shows. " +
          "Used by the survey agent to pick what to research next. " +
          "Returns 404 when no sparse seasons remain.",
        tags: ["Checklist"],
        security: [],
        responses: {
          "200": {
            description: "A suggested show/season to populate",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    show_id: { type: "integer" },
                    show_title: { type: "string" },
                    season_number: { type: "integer" },
                  },
                },
              },
            },
          },
          "404": {
            description: "No sparse seasons remain across the targeted shows",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
    "/checklist/{id}": {
      get: {
        operationId: "getChecklistItem",
        summary: "Get checklist item details",
        tags: ["Checklist"],
        security: [],
        parameters: [idParam],
        responses: {
          "200": {
            description: "Checklist item details",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "404": {
            description: "Checklist item not found",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
      put: {
        operationId: "updateChecklistItem",
        summary: "Update a checklist item",
        description: "Only include fields you want to change.",
        tags: ["Checklist"],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChecklistUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Checklist item updated",
            content: {
              "application/json": { schema: idSlugResponse },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
          "404": {
            description: "Checklist item not found",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
      delete: {
        operationId: "deleteChecklistItem",
        summary: "Delete a checklist item",
        tags: ["Checklist"],
        parameters: [idParam],
        responses: {
          "200": {
            description: "Checklist item deleted",
            content: {
              "application/json": { schema: successResponse },
            },
          },
          "404": {
            description: "Checklist item not found",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },

    // Image Upload
    "/upload-image": {
      get: {
        operationId: "uploadImageDiscovery",
        summary: "Image upload workflow discovery",
        description:
          "Returns the 3-step image upload workflow actions and usage instructions " +
          "for attaching images to sketches, cast members, and people.",
        tags: ["Image Upload"],
        security: [],
        responses: {
          "200": {
            description: "Upload workflow actions and usage",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
    },
    "/upload-image/direct": {
      post: {
        operationId: "uploadImageDirect",
        summary: "Upload image directly",
        description:
          "Upload an image via multipart/form-data. The server handles S3 upload " +
          "and database registration in one step, returning the image_id. " +
          "Use the image_id to attach the image to resources: " +
          "sketch preview image (PUT /sketches/{id} with image_id), " +
          "cast thumbnail (PUT /sketches/{id} with image_id in cast array entries), " +
          "or person images (PUT /people/{id} with images array). " +
          "Max file size: 5MB. Supported types: image/*.",
        tags: ["Image Upload"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/UploadImageDirectInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Image uploaded and registered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    image_id: {
                      type: "integer",
                      description:
                        "Use this ID to attach the image to resources",
                    },
                    cdn_key: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validation error (invalid mime type, file too large, missing fields)",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },

    // Management
    "/revalidate": {
      get: {
        operationId: "revalidateDiscovery",
        summary: "Discover cache revalidation actions",
        tags: ["Management"],
        security: [],
        responses: {
          "200": jsonResponse(
            "Batch and single-entity actions",
            discoverySchema,
          ),
        },
      },
      post: {
        operationId: "batchRevalidate",
        summary: "Revalidate entities and optionally refresh search",
        description:
          "Provide a non-empty entities array or refresh_search: true. Entity failures are reported individually in revalidated; success indicates the batch completed.",
        tags: ["Management"],
        requestBody: jsonBody("BatchRevalidateInput"),
        responses: {
          "200": jsonResponse("Per-entity results and search refresh status", {
            type: "object",
            required: ["success", "revalidated", "search_refreshed"],
            properties: {
              success: { type: "boolean" },
              search_refreshed: { type: "boolean" },
              revalidated: {
                type: "array",
                items: {
                  type: "object",
                  required: ["table", "id", "success"],
                  properties: {
                    table: { type: "string" },
                    id: { type: "integer" },
                    success: { type: "boolean" },
                    error: { type: "string" },
                  },
                },
              },
            },
          }),
          "400": jsonResponse("Validation error", errorRef),
          "401": jsonResponse("Missing or invalid API key", errorRef),
        },
      },
    },
    "/revalidate/{table}/{id}": {
      post: {
        operationId: "revalidateEntity",
        summary: "Revalidate a single entity's cached page",
        tags: ["Management"],
        parameters: [
          {
            name: "table",
            in: "path",
            required: true,
            schema: {
              type: "string",
              enum: [
                "shows",
                "seasons",
                "episodes",
                "sketches",
                "recurring-sketches",
                "people",
                "characters",
                "categories",
                "tags",
              ],
            },
          },
          idParam,
        ],
        responses: {
          "200": jsonResponse("Entity revalidated", successResponse),
          "400": jsonResponse("Invalid table or ID", errorRef),
          "401": jsonResponse("Missing or invalid API key", errorRef),
        },
      },
    },
    "/refresh-search": {
      post: {
        operationId: "refreshSketchSearch",
        summary: "Refresh sketch search index",
        description:
          "Rebuilds the full-text search index for sketches. " +
          "Call this after bulk data changes to ensure search results are up to date.",
        tags: ["Management"],
        responses: {
          "200": {
            description: "Search index refreshed",
            content: { "application/json": { schema: successResponse } },
          },
        },
      },
    },

    // Lookup
    "/lookup/batch": {
      post: {
        operationId: "batchLookupValues",
        summary: "Look up multiple terms across entity tables",
        description:
          "Read-only lookup; no API key required. Returns up to 5 matches per term, grouped by table and term. Accepts up to 20 terms per table.",
        tags: ["Lookup"],
        security: [],
        requestBody: jsonBody("BatchLookupInput"),
        responses: {
          "200": jsonResponse("Matches grouped by table and search term", {
            type: "object",
            additionalProperties: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { $ref: "#/components/schemas/LookupResult" },
              },
            },
          }),
          "400": jsonResponse("Invalid table or search terms", errorRef),
        },
      },
    },
    "/lookup/{table}": {
      get: {
        operationId: "lookupValues",
        summary: "Search for entity IDs by name",
        description:
          "Search for shows, people, tags, and other entities by name to get their IDs. " +
          "Supported tables: show, season, episode, person, character, tag, recurring_sketch, category.",
        tags: ["Lookup"],
        security: [],
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
          {
            name: "limit",
            in: "query",
            description: "Maximum matches (clamped to 1–100; defaults to 10)",
            schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
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

    // Socials — social-posting workflow
    "/socials/unposted": {
      get: {
        operationId: "listUnpostedSketches",
        summary: "List reviewed sketches not yet posted on socials",
        description:
          "Returns a random sample of sketches with review_status 'Reviewed' and " +
          "posted_on_socials false — the work queue for the social-posting agent. " +
          "`total` is the full count still unposted; `sketches` is a random sample " +
          "of up to `limit`. After sharing one, mark it via PUT /socials/{id}.",
        tags: ["Socials"],
        security: [],
        parameters: queryParameters("UnpostedSketchesParams"),
        responses: {
          "200": {
            description: "Random sample of unposted reviewed sketches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sketches: { type: "array", items: { type: "object" } },
                    total: { type: "integer" },
                    limit: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/socials/{id}": {
      put: {
        operationId: "setSketchPostedOnSocials",
        summary: "Mark a sketch posted/unposted on social media",
        description:
          "Sets the posted_on_socials flag on the sketch. Send " +
          "{posted_on_socials: true} after sharing it so it drops out of " +
          "GET /socials/unposted; send false to un-mark it.",
        tags: ["Socials"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Sketch ID (from GET /socials/unposted)",
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SocialPostInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated posting status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    posted_on_socials: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
          "404": {
            description: "Sketch not found",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },

    // Sketch source lookup and review workflow
    "/sketches/by-source": {
      get: {
        operationId: "findSketchesBySource",
        summary: "Find sketches by exact YouTube or Vimeo source",
        description:
          "Without url, returns discovery instructions. With a supported video URL, matches source identities across all sketches, including those awaiting review. Use before creation to detect duplicates.",
        tags: ["Sketches"],
        security: [],
        parameters: [
          {
            name: "url",
            in: "query",
            required: false,
            description: "YouTube or Vimeo video URL",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": jsonResponse(
            "Discovery instructions or exact source matches",
            {
              oneOf: [
                {
                  type: "object",
                  required: ["description", "_linkTemplates"],
                  properties: {
                    description: { type: "string" },
                    _linkTemplates: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
                {
                  type: "object",
                  required: ["source", "sketches", "total"],
                  properties: {
                    source: { type: "string" },
                    total: { type: "integer" },
                    sketches: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          title: { type: "string" },
                          url_slug: { type: "string" },
                          sources: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                    _linkTemplates: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                },
              ],
            },
          ),
          "400": jsonResponse("Unsupported or invalid source URL", errorRef),
        },
      },
    },
    "/sketches/flagged": {
      get: {
        operationId: "listFlaggedSketches",
        summary: "List sketches flagged for review",
        description:
          "Returns all flagged sketches, oldest modification first, with link templates to sketch details and review-status updates.",
        tags: ["Sketches"],
        security: [],
        responses: {
          "200": jsonResponse("Flagged sketches and navigation links", {
            type: "object",
            required: ["sketches", "total"],
            properties: {
              sketches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    title: { type: "string" },
                    url_slug: { type: "string" },
                    flag_note: { type: ["string", "null"] },
                  },
                },
              },
              total: { type: "integer" },
              _links: {
                type: "array",
                items: { $ref: "#/components/schemas/HateoasLink" },
              },
              _linkTemplates: { type: "array", items: { type: "object" } },
            },
          }),
        },
      },
    },
    "/sketches/{id}/review-status": {
      put: {
        operationId: "setSketchReviewStatus",
        summary: "Update a sketch's review status and optional flag note",
        description:
          "A flag_note is required when setting Flagged. Repeating an unchanged status and note leaves audit metadata untouched.",
        tags: ["Sketches"],
        parameters: [idParam],
        requestBody: jsonBody("ReviewStatusInput"),
        responses: {
          "200": jsonResponse("Current review status", {
            type: "object",
            properties: {
              id: { type: "integer" },
              review_status: {
                type: "string",
                enum: ["NeedsReview", "Flagged", "Reviewed", "Reprocessing"],
              },
            },
          }),
          "400": jsonResponse("Invalid sketch ID or request body", errorRef),
          "401": jsonResponse("Missing or invalid API key", errorRef),
          "404": jsonResponse("Sketch not found", errorRef),
        },
      },
    },

    // Sketches Full (all-in-one create/update)
    "/sketches/full": {
      get: {
        operationId: "sketchFullDiscovery",
        summary: "Schema + example for all-in-one sketch create/update",
        description:
          "Returns the SketchFullInput schema with $ref resolved inline, " +
          "a complete example payload, and links to both POST (create) and PUT (update) actions.",
        tags: ["Sketches Full"],
        security: [],
        responses: {
          "200": {
            description: "Schema, example, and actions",
            content: { "application/json": { schema: { type: "object" } } },
          },
        },
      },
      post: {
        operationId: "createSketchFull",
        summary: "Create a sketch (all-in-one)",
        description:
          "RECOMMENDED for sketch creation. Accepts names instead of IDs — " +
          "resolves shows, people, tags, and recurring sketches by name; " +
          "finds or creates seasons and episodes; downloads and uploads images from URLs; " +
          "creates the sketch transactionally; revalidates caches; and refreshes search. " +
          "All in one call.",
        tags: ["Sketches Full"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SketchFullInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Sketch created with all resolved IDs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                    resolved: {
                      type: "object",
                      description:
                        "All IDs that were resolved or created during processing",
                    },
                    revalidated: {
                      type: "array",
                      items: { type: "string" },
                      description: "Entities that were revalidated",
                    },
                    search_refreshed: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description:
              "Validation error (missing fields, name not found, ambiguous match)",
            content: { "application/json": { schema: errorRef } },
          },
        },
      },
    },
    "/sketches/full/{id}": {
      put: {
        operationId: "updateSketchFull",
        summary: "Update a sketch (all-in-one)",
        description:
          "Update a sketch using names instead of IDs. Only provided fields are changed. " +
          "For array fields (cast, tags, quotes), providing the array replaces all existing entries; " +
          "omitting leaves them unchanged. " +
          "Automatically revalidates caches and refreshes search.",
        tags: ["Sketches Full"],
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SketchFullUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Sketch updated with all resolved IDs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    url_slug: { type: "string" },
                    resolved: { type: "object" },
                    revalidated: {
                      type: "array",
                      items: { type: "string" },
                    },
                    search_refreshed: { type: "boolean" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: errorRef } },
          },
          "404": {
            description: "Sketch not found",
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
        "Sketches Full",
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
    {
      name: "Media",
      tags: ["Image Upload"],
    },
    {
      name: "Management",
      tags: ["Checklist", "Socials", "Management"],
    },
  ],
};

export function GET() {
  return NextResponse.json(spec);
}
