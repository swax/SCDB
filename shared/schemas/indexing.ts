import { z } from "zod";
import { positiveId } from "./common";

export const GoogleIndexingInputSchema = z
  .strictObject({
    google_indexing_requested: z
      .boolean()
      .describe(
        "Send true only after Google Search Console confirms 'Indexing requested'. " +
          "Send false to clear an incorrect mark. This does not submit to Google or confirm indexing.",
      ),
  })
  .describe("Request body for PUT /indexing/{id}");

export const GoogleIndexingStatusSchema = z
  .object({
    id: positiveId,
    google_indexing_requested_at: z.iso
      .datetime()
      .nullable()
      .describe(
        "Server timestamp when a confirmed Google indexing request was first recorded. " +
          "Null means no request has been recorded, not necessarily that Google has never indexed the page. " +
          "Repeated true requests preserve the timestamp; false clears it.",
      ),
  })
  .describe(
    "Recorded Google indexing request status; not Google's indexing status",
  );

export const UnrequestedIndexingParamsSchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(30)
      .describe("Maximum sketches to return (default 30, max 100)."),
  })
  .describe(
    "Query parameters for GET /indexing/unrequested. Newest sketches first.",
  );
