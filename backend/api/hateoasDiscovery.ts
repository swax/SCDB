import { NextRequest, NextResponse } from "next/server";

const API_PREFIX = "/api";
const SCHEMAS = `${API_PREFIX}/schemas`;

interface CollectionDiscoveryConfig {
  path: string;
  singular: string;
  plural: string;
  createSchema: string;
  updateSchema?: string;
  listSchema?: string;
}

/**
 * Returns true when the request has no query params, meaning the agent
 * is navigating to this endpoint for discovery rather than listing data.
 */
export function isDiscoveryRequest(request: NextRequest): boolean {
  return request.nextUrl.searchParams.size === 0;
}

/**
 * Build a HATEOAS discovery response for a CRUD collection endpoint.
 * Lists all available actions (list, create, read, update, delete) with
 * schema references so an AI agent knows exactly what it can do.
 */
export function collectionDiscoveryResponse(config: CollectionDiscoveryConfig) {
  const updateSchema = config.updateSchema || config.createSchema;
  const listSchema = config.listSchema || "PaginationParams";

  return NextResponse.json({
    _actions: [
      {
        rel: "list",
        href: `${API_PREFIX}/${config.path}`,
        method: "GET",
        title: `List ${config.plural.toLowerCase()}`,
        schema: `${SCHEMAS}/${listSchema}`,
      },
      {
        rel: "create",
        href: `${API_PREFIX}/${config.path}`,
        method: "POST",
        title: `Create a new ${config.singular.toLowerCase()}`,
        schema: `${SCHEMAS}/${config.createSchema}`,
      },
      {
        rel: "read",
        href: `${API_PREFIX}/${config.path}/{id}`,
        method: "GET",
        title: `Get ${config.singular.toLowerCase()} details`,
      },
      {
        rel: "update",
        href: `${API_PREFIX}/${config.path}/{id}`,
        method: "PUT",
        title: `Update a ${config.singular.toLowerCase()}`,
        schema: `${SCHEMAS}/${updateSchema}`,
      },
      {
        rel: "delete",
        href: `${API_PREFIX}/${config.path}/{id}`,
        method: "DELETE",
        title: `Delete a ${config.singular.toLowerCase()}`,
      },
    ],
  });
}
