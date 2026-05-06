import { z } from "zod";

/**
 * Reusable Zod primitives shared across entity / DTO schemas.
 *
 * Foreign-key IDs and natural-positive integers (years, season numbers,
 * episode numbers) are auto-increment / domain-positive — accepting 0 lets
 * Prisma fail with a 500 that handleApiError doesn't map. Reject early.
 */

export const positiveId = z.number().int().positive();
export const positiveInt = z.number().int().positive();
