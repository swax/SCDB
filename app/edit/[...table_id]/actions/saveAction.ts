"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { TableCms } from "@/backend/cms/cmsTypes";
import { writeFieldValues } from "@/backend/edit/editWriteService";
import ProcessEnv from "@/shared/ProcessEnv";
import { sendBingUpdate, sendGoogleUpdate } from "./searchIndexing";

export default async function saveAction(
  table: TableCms,
  id: number,
  slug: string,
) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    revalidateContent(table.name, id, slug);

    const response = await writeFieldValues(user, table, id);

    // If the name is changing back to something that already existed before,
    // Make sure to revalidate it otherwise we can get into a redirect loop
    const newSlug = response.content?.newSlug;
    if (newSlug && newSlug !== slug) {
      revalidateContent(table.name, id, newSlug);
    }

    // Notify bing/google of changes, skip if in dev mode
    if (ProcessEnv.NODE_ENV === "development") {
      response.warnings ||= [];
      response.warnings.push("Skipping bing/google update in dev mode");
    } else if (response.content) {
      // Update to use next/after once available in v15
      // https://nextjs.org/blog/next-15-rc#executing-code-after-a-response-with-nextafter-experimental

      const tablePath = table.name.replace("_", "-");
      const {rowId, newSlug} = response.content;
      const url = `https://www.sketchtv.lol/${tablePath}/${rowId}/${newSlug || slug}`;
      const bingUpdate = sendBingUpdate(url, response);
      const googleUpdate = sendGoogleUpdate(url, response);
      await Promise.all([bingUpdate, googleUpdate]);
    }

    return response;
  });
}
