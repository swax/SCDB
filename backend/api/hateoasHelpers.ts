import type { HateoasAction, HateoasLink } from "@/shared/schemas/hateoas";
import { user_role_type } from "@/shared/enums";
import { getRoleRank } from "@/shared/roleUtils";

export const API_PREFIX = "/api";

export function selfLink(path: string, title?: string): HateoasLink {
  return { rel: "self", href: `${API_PREFIX}${path}`, ...(title ? { title } : {}) };
}

export function collectionLink(resource: string, title?: string): HateoasLink {
  return {
    rel: "collection",
    href: `${API_PREFIX}/${resource}`,
    title: title ?? resource,
  };
}

export function schemaLink(schemaName: string, title?: string): HateoasLink {
  return {
    rel: "schema",
    href: `${API_PREFIX}/schemas/${schemaName}`,
    ...(title ? { title } : {}),
  };
}

function buildQuery(
  page: number,
  pageSize: number,
  filters?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) params.set(key, value);
    }
  }
  return params.toString();
}

/**
 * Build self/first/last/prev/next pagination links for a list endpoint.
 * `basePath` should NOT include /api prefix (e.g., "checklist", "sketches").
 */
export function paginationLinks(
  basePath: string,
  page: number,
  pageSize: number,
  total: number,
  filters?: Record<string, string | undefined>,
): HateoasLink[] {
  const fullPath = `${API_PREFIX}/${basePath}`;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const links: HateoasLink[] = [
    { rel: "self", href: `${fullPath}?${buildQuery(page, pageSize, filters)}` },
    { rel: "first", href: `${fullPath}?${buildQuery(1, pageSize, filters)}` },
    {
      rel: "last",
      href: `${fullPath}?${buildQuery(totalPages, pageSize, filters)}`,
    },
  ];
  if (page > 1) {
    links.push({
      rel: "prev",
      href: `${fullPath}?${buildQuery(page - 1, pageSize, filters)}`,
    });
  }
  if (page < totalPages) {
    links.push({
      rel: "next",
      href: `${fullPath}?${buildQuery(page + 1, pageSize, filters)}`,
    });
  }
  return links;
}

// --- Declarative HATEOAS action resolver ---

export interface ActionDef<T> {
  rel: string;
  /** Path appended to the resolveActions baseHref. Mutually exclusive with `href`. */
  path?: string;
  /** Absolute href, overrides path+baseHref. */
  href?: string;
  method: string;
  title: string;
  /** Schema name (e.g. "SketchInput"). Rendered as a /api/schemas/{name} link. */
  schema?: string;
  /** Example body, surfaced to clients as a hint. */
  body?: Record<string, unknown>;
  /** Minimum role required to invoke the action. */
  minRole?: user_role_type;
  /** Show only when ctx.status is in this list. Reads ctx.status if present. */
  statuses?: string[];
  /** Hide the action entirely unless this returns true. */
  visibleWhen?: (ctx: T) => boolean;
  /** When the role check fails, omit the action instead of returning a disabled stub. */
  hideWithoutRole?: boolean;
  /** Return a non-null reason to render the action as disabled with that reason. */
  disabledWhen?: (ctx: T) => string | string[] | null;
}

export interface ActionContext {
  user?: { role?: user_role_type };
  status?: string;
}

/**
 * Resolve a declarative list of action definitions into the final
 * HateoasAction[] for a response body. Filters by status/visibleWhen,
 * gates on role, and computes disabled state with reasons.
 */
export function resolveActions<T extends ActionContext>(
  defs: ActionDef<T>[],
  baseHref: string,
  ctx: T,
): HateoasAction[] {
  const actions: HateoasAction[] = [];

  for (const def of defs) {
    if (def.statuses && (!ctx.status || !def.statuses.includes(ctx.status))) {
      continue;
    }
    if (def.visibleWhen && !def.visibleWhen(ctx)) continue;

    const meetsRole =
      !def.minRole ||
      getRoleRank(ctx.user?.role) >= getRoleRank(def.minRole);
    if (def.hideWithoutRole && !meetsRole) continue;

    const roleGate =
      !meetsRole && def.minRole
        ? {
            disabled: true as const,
            disabledReason: `Requires ${def.minRole} role`,
          }
        : {};

    const disabledReason =
      meetsRole && def.disabledWhen ? def.disabledWhen(ctx) : null;

    actions.push({
      rel: def.rel,
      href: def.href ?? baseHref + (def.path ?? ""),
      method: def.method,
      title: def.title,
      ...(def.schema ? { schema: `${API_PREFIX}/schemas/${def.schema}` } : {}),
      ...(def.body ? { body: def.body } : {}),
      ...roleGate,
      ...(disabledReason ? { disabled: true, disabledReason } : {}),
    });
  }

  return actions;
}
