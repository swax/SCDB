"use server";

import { revalidatePath } from "next/cache";
import { revalidateContent } from "../contentBase";

// Server actions must be async, but we have nothing to await here
// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidate(table: string, slug: string) {
  revalidateContent(table, slug);
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidateRoot() {
  revalidatePath("/");
}
