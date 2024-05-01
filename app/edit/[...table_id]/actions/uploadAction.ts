"use server";

import authOptions from "@/app/api/auth/[...nextauth]/authOptions";
import ProcessEnv from "@/shared/ProcessEnv";
import { canEdit } from "@/shared/roleUtils";
import { contentResponse, errorResponse } from "@/shared/serviceResponse";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getServerSession } from "next-auth";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

const _fileSizeLimitMb = 5;

export async function getPresignedUploadUrl(
  uploadType: "images",
  tableName: string,
  fileName: string,
  fileType: string,
  fileSize: number,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return errorResponse("You must login to save changes");
  }

  if (!canEdit(session.user.role)) {
    return errorResponse("You do not have permission to edit");
  }

  const validationError = _validateFile(fileType, fileSize);
  if (validationError) {
    return validationError;
  }

  // Build aws key
  const miniUserId = session.user.id.substring(0, 6);
  const guid = uuidv4().substring(0, 4);
  const slugName = slugify(fileName, { lower: true });
  const uploadFileName = `${miniUserId}_${guid}_${slugName}`;

  const awsKey = `${uploadType}/${tableName}/${uploadFileName}`;

  // Get the pre-signed url
  const signedPost = await _getSignedPost(awsKey, fileSize);

  return contentResponse(signedPost);
}

function _validateFile(fileType: string, fileSize: number) {
  if (!fileType.startsWith("image/")) {
    return errorResponse("File must be an image");
  }

  if (
    !isFinite(fileSize) ||
    isNaN(fileSize) ||
    fileSize > _fileSizeLimitMb * 1_000_000
  ) {
    return errorResponse(`File size must be a less than ${_fileSizeLimitMb}MB`);
  }
}

async function _getSignedPost(key: string, fileSize: number) {
  const client = new S3Client({
    region: ProcessEnv.NEXT_PUBLIC_AWS_REGION,
  });

  const presignedPost = await createPresignedPost(client, {
    Bucket: ProcessEnv.NEXT_PUBLIC_AWS_BUCKET,
    Key: key,
    Conditions: [["content-length-range", fileSize, fileSize]],
    Fields: {},
    Expires: 60, // Seconds
  });

  return presignedPost;
}
