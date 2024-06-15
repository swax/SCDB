import { user_role_type } from "@prisma/client";

interface ProcessEnv extends NodeJS.ProcessEnv {
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly NEXTAUTH_SECRET: string;
  readonly NEXT_PUBLIC_AWS_BUCKET: string;
  readonly NEXT_PUBLIC_AWS_REGION: string;
  readonly MIN_EDIT_ROLE: user_role_type;
  readonly STATIC_PAGE_COUNT: string;
  readonly DEFAULT_PAGE_LIST_SIZE: string;
}

// todo easier way to force cast?
// also this won't work in client side code

const ProcessEnv = process.env as ProcessEnv;

export function getStaticPageCount(): number {
  return parseInt(ProcessEnv.STATIC_PAGE_COUNT || "10000");
}

export function getDefaultPageListSize(): number {
  return parseInt(ProcessEnv.DEFAULT_PAGE_LIST_SIZE || "30");
}

export default ProcessEnv;
