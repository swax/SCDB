import { getLoggedInUser, validateRoleAtLeast } from "@/backend/actionHelper";
import { authenticateApiRequest } from "@/backend/api/apiAuth";
import ProcessEnv from "@/shared/ProcessEnv";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { user_role_type } from "@/shared/enums";
import { NextRequest } from "next/server";

const FILE_SIZE_LIMIT_MB = 5;

export interface AuthResult {
  isApiToken: boolean;
  userId?: string;
}

export async function validateUploadAuth(
  request: NextRequest,
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const user = await authenticateApiRequest(request);
    return { isApiToken: true, userId: user.id };
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
  mimeType: string,
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
  userTag: string,
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

export async function uploadToS3(
  key: string,
  body: Buffer,
  mimeType: string,
): Promise<void> {
  const client = new S3Client({
    region: ProcessEnv.NEXT_PUBLIC_AWS_REGION,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: ProcessEnv.NEXT_PUBLIC_AWS_BUCKET,
      Key: key,
      Body: body,
      ContentType: mimeType,
    }),
  );
}

export function computeShortHash(buffer: Buffer): string {
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(buffer).digest("hex").substring(0, 8);
}
