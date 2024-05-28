"use server";

import { revalidateContent } from "../(content)/contentBase";

// Server actions must be async, but we have nothing to await here
// eslint-disable-next-line @typescript-eslint/require-await
export async function invalidate(table: string, id: number) {
  revalidateContent(table, id);
}
