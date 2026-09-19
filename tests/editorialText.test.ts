import { describe, expect, test } from "vitest";
import {
  SketchInputSchema,
  SketchUpdateInputSchema,
} from "../shared/schemas/sketch";
import {
  SketchFullInputSchema,
  SketchFullUpdateInputSchema,
} from "../shared/schemas/sketchFull";

describe("public editorial fields", () => {
  const schemas = [
    [SketchInputSchema, { title: "Snackhomiez", show_id: 1 }],
    [SketchUpdateInputSchema, {}],
    [
      SketchFullInputSchema,
      { title: "Snackhomiez", show: "Saturday Night Live" },
    ],
    [SketchFullUpdateInputSchema, {}],
  ] as const;
  test.each(["notes", "synopsis", "teaser"])(
    "rejects workflow artifacts in %s across create/update APIs",
    (field) => {
      for (const [schema, base] of schemas) {
        for (const text of [
          "StarMapr manifest accepted; no portraits added.",
          "NEW-SKETCH run 80 test restrictions",
          "Cache: /home/swax/StarMapr/05_videos/youtube_123",
        ]) {
          expect(schema.safeParse({ ...base, [field]: text }).success).toBe(
            false,
          );
        }
        expect(
          schema.safeParse({
            ...base,
            [field]:
              "A$AP Rocky appears in this sketch about snack mascots. First broadcast January 17, 2026.",
          }).success,
        ).toBe(true);
      }
    },
  );
});
