import { z } from "zod";

/** Guard known workflow artifacts, not general editorial vocabulary. Evidence
 * belongs in the work order's comments/attachments, never the public article. */
export const publicEditorialText = z
  .string()
  .refine(
    (text) =>
      !/(?:\b(?:StarMapr|STARMAPR_PROGRESS)\b|\bNEW-SKETCH\s+(?:run|op|revision)\b|\b(?:retryNotBefore|video_folder|accepted_result_manifest)\b|(?:\/home\/[^\s/]+\/|\b05_videos\/)|\b(?:this run|run \d+)\b[^\n.]{0,100}\b(?:no[- ]portrait|portrait omission|test restriction))/i.test(
        text,
      ),
    "Public editorial text contains internal workflow evidence. Put operational notes, local paths, manifests and test restrictions in ERP comments/attachments; keep this field about the sketch.",
  )
  .describe(
    "Public, visitor-facing editorial text about the sketch. Internal workflow evidence belongs in ERP comments/attachments.",
  );
