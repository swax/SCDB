"use server";

import { revalidatePath } from "next/cache";
import { revalidateContent } from "../(content)/contentBase";

// Server actions must be async, but we have nothing to await here
// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidate(table: string, id: number) {
  revalidateContent(table, id);
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidateAll() {
  revalidatePath("/");
}
