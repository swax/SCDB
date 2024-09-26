"use server";

import { getChangelog } from "@/backend/mgmt/changelogService";
import { getActivityGrid } from "@/backend/user/profileService";

export async function getChangeLogAction(
  username: string,
  page: number,
  rowsPerPage: number,
) {
  return await getChangelog({
    username,
    page,
    rowsPerPage,
  });
}

export async function getActivityGridAction(userId: string, daysBack: number) {
  return await getActivityGrid(userId, daysBack);
}
