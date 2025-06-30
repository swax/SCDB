"use server";

import { revalidateContent } from "@/app/(content)/contentBase";
import { catchServiceErrors, getLoggedInUser } from "@/backend/actionHelper";
import { TableCms } from "@/backend/cms/cmsTypes";
import {
  getSlugForId,
  writeFieldValues,
} from "@/backend/edit/editWriteService";
import ProcessEnv from "@/shared/ProcessEnv";
import { sendBingUpdate, sendGoogleUpdate } from "./searchIndexing";

export default async function saveAction(table: TableCms, id: number) {
  return await catchServiceErrors(async () => {
    const user = await getLoggedInUser();

    let slug: string | undefined;

    if (id) {
      slug = await getSlugForId(table, id);
      revalidateContent(table.name, id, slug);
    }

    const response = await writeFieldValues(user, table, id);

    if (!response.content) {
      return response;
    }

    // If the name is changing back to something that already existed before,
    // Make sure to revalidate it otherwise we can get into a redirect loop
    const { rowId, newSlug } = response.content;

    if (newSlug && newSlug !== slug) {
      revalidateContent(table.name, id, newSlug);
    }

    // Notify bing/google of changes, skip if in dev mode
    const slugPath = newSlug || slug;

    response.warnings ||= [];

    if (!rowId) {
      response.warnings.push("No row id to send for search index update");
    } else if (!slugPath) {
      response.warnings.push(
        `No slug path to send for search index update. New Slug: ${newSlug}, Old Slug: ${slug}`,
      );
    } else if (ProcessEnv.NODE_ENV != "development") {
      // Update to use next/after once available in v15
      // https://nextjs.org/blog/next-15-rc#executing-code-after-a-response-with-nextafter-experimental
      const tablePath = table.name.replace("_", "-");
      const url = `https://www.sketchtv.lol/${tablePath}/${rowId}/${slugPath}`;
      const bingUpdate = sendBingUpdate(url, response);

      // Disable this, not meant for how we are using it, no changes are being registered by google
      // const googleUpdate = sendGoogleUpdate(url, response);

      await Promise.all([bingUpdate]); //, googleUpdate]);
    }

    return response;
  });
}
