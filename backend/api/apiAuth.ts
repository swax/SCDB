import prisma, { getPrismaModel } from "@/database/prisma";
import { user_role_type } from "@/shared/enums";
import { SessionUser } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { InputValidationError } from "./sketchApiService";

/**
 * Check if a record already exists by its unique constraint fields.
 * Returns a 409 response with existing_id if found, or null to proceed.
 */
export async function conflictIfExists(
  table: string,
  uniqueWhere: Record<string, unknown>,
  label: string,
): Promise<NextResponse | null> {
  const existing = await getPrismaModel(table).findFirst({
    where: uniqueWhere,
    select: { id: true, url_slug: true },
  });

  if (!existing) return null;

  return NextResponse.json(
    {
      error: `${label} already exists`,
      code: "CONFLICT",
      existing_id: existing.id as number,
      existing_url_slug: (existing.url_slug as string) || undefined,
    },
    { status: 409 },
  );
}

/**
 * Validates the API key from the Authorization header and returns the
 * associated user. The API_KEY and API_USER_ID environment variables
 * must be configured.
 */
export async function authenticateApiRequest(
  request: NextRequest,
): Promise<SessionUser> {
  const apiKey = process.env.API_KEY;
  const apiUserId = process.env.API_USER_ID;

  if (!apiKey || !apiUserId) {
    throw new ApiError(
      500,
      "API_KEY and API_USER_ID environment variables must be configured",
    );
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "Missing or invalid Authorization header. Expected: Bearer <API_KEY>",
    );
  }

  const token = authHeader.slice(7);

  if (token !== apiKey) {
    throw new ApiError(401, "Invalid API key");
  }

  // Look up the user to get their role
  const user = await prisma.user.findUnique({
    where: { id: apiUserId },
    select: { id: true, name: true, username: true, role: true },
  });

  if (!user) {
    throw new ApiError(
      500,
      "API_USER_ID does not match any user in the database",
    );
  }

  return {
    id: user.id,
    username: user.username || "api-agent",
    role: user.role as user_role_type,
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorJson(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return errorJson(error.status, error.message);
  }

  if (error instanceof InputValidationError) {
    return errorJson(400, error.message);
  }

  // Prisma unique constraint violation
  if (isPrismaUniqueConstraintError(error)) {
    const fields =
      (error as { meta?: { target?: string[] } }).meta?.target ?? [];
    return NextResponse.json(
      {
        error: `A record with the same ${fields.join(", ")} already exists`,
        code: "CONFLICT",
        constraint_fields: fields,
      },
      { status: 409 },
    );
  }

  console.error("API error:", error);
  return errorJson(
    500,
    error instanceof Error ? error.message : "Internal server error",
  );
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}
