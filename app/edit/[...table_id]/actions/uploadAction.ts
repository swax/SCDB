"use server";

import { catchServiceErrors, getLoggedInUser, validateRoleAtLeast } from "@/backend/actionHelper";
import { buildUploadKey, createPresignedUploadUrl, getUserTag, validateImageFile } from "@/backend/imageHelper";
import { contentResponse } from "@/shared/serviceResponse";
import { user_role_type } from "@prisma/client";

export async function getPresignedUploadUrl(
  uploadType: "images",
  tableName: string,
  fileHash: string,
  fileType: string,
  fileSize: number,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    validateRoleAtLeast(user.role, user_role_type.Editor);

    validateImageFile(fileType, fileSize);

    // Build aws key
    const userTag = getUserTag({ isApiToken: false, userId: user.id });
    const awsKey = buildUploadKey(tableName, fileHash, fileType, userTag);

    // Get the pre-signed url
    const signedPost = await createPresignedUploadUrl(awsKey, fileSize);

    return contentResponse(signedPost);
  });
}

