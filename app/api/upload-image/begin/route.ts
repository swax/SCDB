import {
  buildUploadKey,
  createPresignedUploadUrl,
  getUserTag,
  validateImageFile,
  validateUploadAuth,
} from "@/backend/imageHelper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateUploadAuth(request);

    // Parse request body
    const body = await request.json();
    const { table_name, file_name, mime_type, file_size, file_hash } = body;

    if (!table_name || !file_name || !mime_type || !file_size || !file_hash) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: table_name, file_name, mime_type, file_size, file_hash",
        },
        { status: 400 }
      );
    }

    // Validate file
    validateImageFile(mime_type, file_size);

    // Build AWS key
    const userTag = getUserTag(authResult);
    const awsKey = buildUploadKey(table_name, file_name, file_hash, mime_type, userTag);

    // Get presigned URL
    const signedPost = await createPresignedUploadUrl(awsKey, file_size, mime_type);
    
    // Return presigned URL data for client upload
    return NextResponse.json({
      success: true,
      presigned_post: signedPost,
      aws_key: awsKey,
      message: "Presigned URL generated successfully"
    });
  } catch (error) {
    console.error("Upload begin API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
