import { handleApiError } from "@/backend/api/apiAuth";
import { validateUploadAuth } from "@/backend/imageHelper";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    await validateUploadAuth(request);

    // Parse request body
    const body = (await request.json()) as { cdn_key?: string };
    const { cdn_key } = body;

    if (!cdn_key) {
      return NextResponse.json(
        { error: "Missing required field: cdn_key" },
        { status: 400 },
      );
    }

    // Get the user ID for NAISYS user
    const naisysUserId = await _getUserIdByUsername("NAISYS");

    if (!naisysUserId) {
      return NextResponse.json(
        { error: "NAISYS user not found" },
        { status: 500 },
      );
    }

    // Create image record in database
    const imageRecord = await prisma.image.create({
      data: {
        cdn_key,
        created_by_id: naisysUserId,
      },
    });

    return NextResponse.json({
      success: true,
      image_id: imageRecord.id,
      message: "Image record created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

async function _getUserIdByUsername(username: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error("Error finding user by username:", error);
    return null;
  }
}
