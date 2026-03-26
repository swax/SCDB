import { handleApiError } from "@/backend/api/apiAuth";
import {
  buildUploadKey,
  computeShortHash,
  getUserTag,
  uploadToS3,
  validateImageFile,
  validateUploadAuth,
} from "@/backend/imageHelper";
import prisma from "@/database/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateUploadAuth(request);

    const formData = await request.formData();
    const file = formData.get("file");
    const tableName = formData.get("table_name");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing required field: file (multipart/form-data)" },
        { status: 400 },
      );
    }

    if (!tableName || typeof tableName !== "string") {
      return NextResponse.json(
        { error: "Missing required field: table_name" },
        { status: 400 },
      );
    }

    const mimeType = file.type || "image/jpeg";
    const fileSize = file.size;

    validateImageFile(mimeType, fileSize);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeShortHash(buffer);
    const userTag = getUserTag(authResult);
    const awsKey = buildUploadKey(
      tableName,
      file.name,
      fileHash,
      mimeType,
      userTag,
    );

    await uploadToS3(awsKey, buffer, mimeType);

    const naisysUser = await prisma.user.findUnique({
      where: { username: "NAISYS" },
      select: { id: true },
    });

    if (!naisysUser) {
      return NextResponse.json(
        { error: "NAISYS user not found" },
        { status: 500 },
      );
    }

    const imageRecord = await prisma.image.create({
      data: {
        cdn_key: awsKey,
        created_by_id: naisysUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      image_id: imageRecord.id,
      cdn_key: awsKey,
      message: "Image uploaded and registered successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
