import { authenticateApiRequest, handleApiError } from "@/backend/api/apiAuth";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await authenticateApiRequest(request);
    await prisma.$executeRaw`SELECT refresh_sketch_search()`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
