import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  spec: {
    url: "/api/openapi.json",
  },
  theme: "kepler" as const,
};

export const GET = ApiReference(config);
