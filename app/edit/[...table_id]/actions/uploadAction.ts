"use server";

import {
  catchServiceErrors,
  getLoggedInUser,
  validateRoleAtLeast,
} from "@/backend/actionHelper";
import {
  buildUploadKey,
  createPresignedUploadUrl,
  getUserTag,
  validateImageFile,
} from "@/backend/imageHelper";
import { contentResponse } from "@/shared/serviceResponse";
import { user_role_type } from "@/shared/enums";

export async function getPresignedUploadUrl(
  uploadType: "images",
  tableName: string,
  fileName: string,
  fileHash: string,
  mimeType: string,
  fileSize: number,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    validateRoleAtLeast(user.role, user_role_type.Editor);

    validateImageFile(mimeType, fileSize);

    // Build aws key
    const userTag = getUserTag({ isApiToken: false, userId: user.id });
    const awsKey = buildUploadKey(
      tableName,
      fileName,
      fileHash,
      mimeType,
      userTag,
    );

    // Get the pre-signed url
    const signedPost = await createPresignedUploadUrl(
      awsKey,
      fileSize,
      mimeType,
    );

    return contentResponse(signedPost);
  });
}
