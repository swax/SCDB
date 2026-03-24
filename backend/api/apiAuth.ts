import prisma from "@/database/prisma";
import { user_role_type } from "@/shared/enums";
import { SessionUser } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
  console.error("API error:", error);
  return errorJson(
    500,
    error instanceof Error ? error.message : "Internal server error",
  );
}
