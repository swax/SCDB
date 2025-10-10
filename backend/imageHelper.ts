import { getLoggedInUser, validateRoleAtLeast } from "@/backend/actionHelper";
import ProcessEnv from "@/shared/ProcessEnv";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { user_role_type } from "@prisma/client";
import { NextRequest } from "next/server";

const FILE_SIZE_LIMIT_MB = 5;

export interface AuthResult {
  isApiToken: boolean;
  userId?: string;
}

export async function validateUploadAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");
  const isApiToken = authHeader?.startsWith("Bearer ");
  
  if (isApiToken && authHeader) {
    const token = authHeader.substring(7);
    const expectedToken = process.env.UPLOAD_API_TOKEN;
    
    if (!expectedToken || token !== expectedToken) {
      throw new Error("Invalid API token");
    }
    
    return { isApiToken: true };
  } else {
    const user = await getLoggedInUser();
    validateRoleAtLeast(user.role, user_role_type.Editor);
    return { isApiToken: false, userId: user.id };
  }
}

export function validateImageFile(mimeType: string, fileSize: number): void {
  if (!mimeType.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (
    !isFinite(fileSize) ||
    isNaN(fileSize) ||
    fileSize > FILE_SIZE_LIMIT_MB * 1_000_000
  ) {
    throw new Error(`File size must be less than ${FILE_SIZE_LIMIT_MB}MB`);
  }
}

export async function createPresignedUploadUrl(
  key: string,
  fileSize: number,
  mimeType: string
) {
  const client = new S3Client({
    region: ProcessEnv.NEXT_PUBLIC_AWS_REGION,
  });

  const presignedPost = await createPresignedPost(client, {
    Bucket: ProcessEnv.NEXT_PUBLIC_AWS_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", fileSize, fileSize],
      ["eq", "$Content-Type", mimeType],
    ],
    Fields: {
      "Content-Type": mimeType,
    },
    Expires: 60, // Seconds
  });

  return presignedPost;
}

export function buildUploadKey(
  tableName: string,
  fileName: string,
  fileHash: string,
  mimeType: string,
  userTag: string
): string {
  const fileExt = mimeType.split("/")[1];
  const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  const sanitizedFileName = fileNameWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_");
  const uploadFileName = `${userTag}_${sanitizedFileName}_${fileHash}.${fileExt}`;
  return `images/${tableName}/${uploadFileName}`;
}

export function getUserTag(authResult: AuthResult): string {
  return authResult.isApiToken ? "api001" : authResult.userId!.substring(0, 6);
}
