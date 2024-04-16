"use server";

import ProcessEnv from "@/shared/ProcessEnv";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
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
  _validateFile(fileType, fileSize);

  // Build aws key
  const guid = uuidv4().substring(0, 8);
  const slugName = slugify(fileName, { lower: true });
  const uploadFileName = `${guid}_${slugName}`;

  const awsKey = `${uploadType}/${tableName}/${uploadFileName}`;

  // Get the pre-signed url
  return await _getSignedPost(awsKey, fileSize);
}

function _validateFile(fileType: string, fileSize: number) {
  if (!fileType.startsWith("image/")) {
    throw "File must be an image";
  }

  const mbLimit = 5;
  if (
    !isFinite(fileSize) ||
    isNaN(fileSize) ||
    fileSize > mbLimit * 1_000_000
  ) {
    throw `File size must be a less than ${mbLimit}MB`;
  }
}

async function _getSignedPost(key: string, fileSize: number) {
  const client = new S3Client({
    region: ProcessEnv.NEXT_PUBLIC_AWS_REGION,
  });

  return await createPresignedPost(client, {
    Bucket: ProcessEnv.NEXT_PUBLIC_AWS_BUCKET,
    Key: key,
    Conditions: [["content-length-range", fileSize, fileSize]],
    Fields: {},
    Expires: 60, // Seconds
  });
}
