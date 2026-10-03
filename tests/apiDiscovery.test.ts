import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import type { HateoasAction, HateoasLink } from "@/shared/schemas/hateoas";

const { getShowsList, getSketch } = vi.hoisted(() => ({
  getShowsList: vi.fn(),
  getSketch: vi.fn(),
}));
vi.mock("@/backend/content/showService", () => ({ getShowsList }));
vi.mock("@/backend/content/sketchService", () => ({ getSketch }));
vi.mock("@/backend/api/apiAuth", () => ({
  authenticateApiRequest: vi.fn(),
  ApiError: class extends Error {},
  handleApiError: (error: Error) =>
    Response.json({ error: error.message }, { status: 400 }),
}));
vi.mock("@/backend/api/entityApiService", () => ({
  buildEntityTableCms: vi.fn(),
}));
vi.mock("@/backend/api/sketchApiService", () => ({
  buildTableCmsFromInput: vi.fn(),
  prepareMappingReplacements: vi.fn(),
}));
vi.mock("@/backend/edit/editReadService", () => ({
  findAndBuildTableCms: vi.fn(),
}));
vi.mock("@/backend/edit/editWriteService", () => ({
  deleteRow: vi.fn(),
  writeFieldValues: vi.fn(),
}));

import { GET as getOpenApi } from "../app/api/openapi.json/route";
import { GET as getRoot } from "../app/api/route";
import { GET as getShows } from "../app/api/shows/route";
import { GET as getSketchDetail } from "../app/api/sketches/[id]/route";
import {
  schemaRegistry,
  resolveSchemaRefs,
} from "@/backend/api/schemaRegistry";

type JsonSchema = {
  $ref?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  oneOf?: JsonSchema[];
};
type Operation = {
  description?: string;
  security?: unknown[];
  parameters?: { name: string; required?: boolean; schema: JsonSchema }[];
  requestBody?: { content: { "application/json": { schema: JsonSchema } } };
  responses: Record<
    string,
    { content: { "application/json": { schema: JsonSchema } } }
  >;
};
type Spec = { paths: Record<string, Record<string, Operation>> };
const spec = (await getOpenApi().json()) as Spec;

beforeEach(() => {
  vi.clearAllMocks();
  getShowsList.mockResolvedValue({
    list: [{ id: 1, title: "Test show" }],
    count: 1,
  });
  getSketch.mockResolvedValue({
    id: 1,
    title: "Test sketch",
    review_status: "Reviewed",
  });
});

test("every API-root discovery link has an explicit OpenAPI path", async () => {
  const root = (await getRoot().json()) as { _links: HateoasLink[] };
  for (const link of root._links) {
    const path = link.href.split("?")[0].slice(4).replace(/\/$/, "") || "/";
    expect(spec.paths, link.href).toHaveProperty(path);
  }
});

test.each([
  ["/shows", "PaginationParams"],
  ["/seasons", "SeasonListParams"],
  ["/episodes", "EpisodeListParams"],
  ["/sketches", "SketchListParams"],
  ["/recurring-sketches", "RecurringSketchListParams"],
  ["/people", "PaginationParams"],
  ["/characters", "PaginationParams"],
  ["/categories", "PaginationParams"],
  ["/tags", "TagListParams"],
  ["/checklist", "ChecklistPaginationParams"],
  ["/socials/unposted", "UnpostedSketchesParams"],
  ["/indexing/unrequested", "UnrequestedIndexingParams"],
])("%s documents its runtime filters and defaults", (path, schemaName) => {
  const runtime = resolveSchemaRefs(schemaRegistry[schemaName]) as JsonSchema;
  const params = spec.paths[path].get.parameters!;
  expect(params.map((param) => param.name).sort()).toEqual(
    Object.keys(runtime.properties!).sort(),
  );
  for (const param of params) {
    expect(param.required).toBe(false);
    expect(param.schema).toEqual(runtime.properties![param.name]);
  }
});

test.each([
  "shows",
  "seasons",
  "episodes",
  "sketches",
  "recurring-sketches",
  "people",
  "characters",
  "categories",
  "tags",
  "checklist",
])(
  "%s documents discovery and paginated data as separate response variants",
  (path) => {
    const operation = spec.paths[`/${path}`].get;
    const variants =
      operation.responses["200"].content["application/json"].schema.oneOf!;
    expect(operation.description).toContain("?page=1");
    expect(variants).toHaveLength(2);
    expect(variants[0].required).toContain("_actions");
    expect(variants[1].required).toEqual(
      expect.arrayContaining(["total", "page", "pageSize"]),
    );
  },
);

test("shows really return discovery without parameters and data with page=1", async () => {
  const discovery = (await (
    await getShows(new NextRequest("http://localhost/api/shows"))
  ).json()) as { _actions: HateoasAction[] };
  expect(discovery._actions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        rel: "list",
        method: "GET",
        schema: "/api/schemas/PaginationParams",
      }),
    ]),
  );
  expect(getShowsList).not.toHaveBeenCalled();
  const data = (await (
    await getShows(new NextRequest("http://localhost/api/shows?page=1"))
  ).json()) as Record<string, unknown>;
  expect(data).toMatchObject({
    shows: [{ id: 1, title: "Test show" }],
    total: 1,
    page: 1,
  });
  expect(getShowsList).toHaveBeenCalledOnce();
});

test("sketch full-update action advertises the endpoint's actual request schema", async () => {
  const response = await getSketchDetail(
    new NextRequest("http://localhost/api/sketches/1"),
    { params: Promise.resolve({ id: "1" }) },
  );
  const body = (await response.json()) as { _actions: HateoasAction[] };
  const action = body._actions.find((item) => item.rel === "update")!;
  expect(action.href).toBe("/api/sketches/full/1");
  const ref =
    spec.paths["/sketches/full/{id}"].put.requestBody!.content[
      "application/json"
    ].schema.$ref!;
  expect(action.schema).toBe(`/api/schemas/${ref.split("/").at(-1)}`);
  expect(schemaRegistry["SketchFullUpdateInput"]).toBeDefined();
});

test("sketch indexing action matches the authenticated endpoint and registered schema", async () => {
  const response = await getSketchDetail(
    new NextRequest("http://localhost/api/sketches/1"),
    {
      params: Promise.resolve({ id: "1" }),
    },
  );
  const body = (await response.json()) as { _actions: HateoasAction[] };
  expect(
    body._actions.find((item) => item.rel === "mark-indexing-requested"),
  ).toMatchObject({
    href: "/api/indexing/1",
    method: "PUT",
    schema: "/api/schemas/GoogleIndexingInput",
    body: { google_indexing_requested: true },
  });
  expect(spec.paths["/indexing/{id}"].get.security).toEqual([]);
  expect(
    spec.paths["/indexing/{id}"].put.requestBody!.content["application/json"]
      .schema.$ref,
  ).toBe("#/components/schemas/GoogleIndexingInput");
});

test("batch lookup is documented as a public POST with grouped results", () => {
  const operation = spec.paths["/lookup/batch"].post;
  expect(operation.security).toEqual([]);
  expect(operation.requestBody!.content["application/json"].schema.$ref).toBe(
    "#/components/schemas/BatchLookupInput",
  );
  expect(
    operation.responses["200"].content["application/json"].schema,
  ).toMatchObject({
    type: "object",
    additionalProperties: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: { $ref: "#/components/schemas/LookupResult" },
      },
    },
  });
});

test("source lookup documents its optional query and both discovery/data responses", () => {
  const operation = spec.paths["/sketches/by-source"].get;
  expect(operation.security).toEqual([]);
  expect(operation.parameters).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "url", required: false }),
    ]),
  );
  const variants =
    operation.responses["200"].content["application/json"].schema.oneOf!;
  expect(variants[0].required).toContain("description");
  expect(variants[1].required).toEqual(["source", "sketches", "total"]);
  expect(operation.responses["400"]).toBeDefined();
});

test("review and revalidation workflows document public discovery and authenticated writes", () => {
  expect(spec.paths["/sketches/flagged"].get.security).toEqual([]);
  expect(spec.paths["/revalidate"].get.security).toEqual([]);
  for (const [path, method] of [
    ["/indexing/{id}", "put"],
    ["/revalidate", "post"],
    ["/revalidate/{table}/{id}", "post"],
    ["/sketches/{id}/review-status", "put"],
  ]) {
    const operation = spec.paths[path][method];
    expect(operation.security).toBeUndefined(); // Inherits top-level bearer authentication.
    expect(operation.responses["401"]).toBeDefined();
  }
});

test("lookup documents its supported result limit", () => {
  expect(spec.paths["/lookup/{table}"].get.parameters).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "limit",
        schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
      }),
    ]),
  );
});
