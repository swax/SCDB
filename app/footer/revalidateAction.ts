"use server";

import { revalidatePath } from "next/cache";
import { revalidateContent } from "../(content)/contentBase";

// Server actions must be async, but we have nothing to await here
// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidate(table: string, id: number, slug: string) {
  revalidateContent(table, id, slug);
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidateRoot() {
  revalidatePath("/");
}
