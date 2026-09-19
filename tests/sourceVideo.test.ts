import { describe, expect, it, vi } from "vitest";
import { sourceVideoKey } from "../shared/sourceVideo";

const mock = vi.hoisted(() => {
  const tx = { sketch: { findMany: vi.fn() }, $queryRaw: vi.fn() };
  return {
    tx,
    db: {
      $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
        callback(tx),
      ),
      sketch: tx.sketch,
    },
  };
});
vi.mock("../database/prisma", () => ({ default: mock.db }));
vi.mock("../backend/api/apiAuth", () => ({
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
import {
  findSketchesBySource,
  withSourceGuard,
} from "../backend/api/sketchSourceService";

describe("exact source identity", () => {
  it.each([
    "https://www.youtube.com/watch?v=I2eQDTDm2O0&t=20",
    "https://youtu.be/I2eQDTDm2O0?si=test",
    "https://m.youtube.com/shorts/I2eQDTDm2O0",
    "https://www.youtube-nocookie.com/embed/I2eQDTDm2O0",
  ])("normalizes %s", (url) => {
    expect(sourceVideoKey(url)).toBe("youtube:I2eQDTDm2O0");
  });
  it.each([
    "https://youtube.com.evil.invalid/watch?v=I2eQDTDm2O0",
    "https://evil.invalid/I2eQDTDm2O0",
    "https://youtube.com/watch?v=bad",
    "not a url",
  ])("rejects %s", (url) => {
    expect(sourceVideoKey(url)).toBeNull();
  });
  it("finds the same source under a different title and alias URL", async () => {
    mock.tx.sketch.findMany.mockResolvedValue([
      {
        id: 691,
        title: "Different title",
        url_slug: "fixture",
        video_urls: ["https://youtu.be/I2eQDTDm2O0"],
      },
    ]);
    expect(
      await findSketchesBySource(["https://youtube.com/watch?v=I2eQDTDm2O0"]),
    ).toEqual([
      {
        id: 691,
        title: "Different title",
        url_slug: "fixture",
        sources: ["youtube:I2eQDTDm2O0"],
      },
    ]);
  });
  it("rejects duplicate creation before invoking the writer", async () => {
    mock.tx.sketch.findMany.mockResolvedValue([
      {
        id: 691,
        title: "Existing",
        url_slug: "fixture",
        video_urls: ["https://youtu.be/I2eQDTDm2O0"],
      },
    ]);
    const write = vi.fn();
    await expect(
      withSourceGuard(
        ["https://youtube.com/watch?v=I2eQDTDm2O0"],
        false,
        write,
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(write).not.toHaveBeenCalled();
  });
  it("passes the locked transaction to creation and propagates failure for rollback", async () => {
    mock.tx.sketch.findMany.mockResolvedValue([]);
    const write = vi.fn().mockRejectedValue(new Error("fixture rollback"));
    await expect(
      withSourceGuard(["https://youtu.be/I2eQDTDm2O0"], false, write),
    ).rejects.toThrow("fixture rollback");
    expect(write).toHaveBeenCalledWith(mock.tx);
    expect(mock.tx.$queryRaw).toHaveBeenCalled();
  });
  it("supports intentional compilation entries only through an explicit override", async () => {
    const write = vi.fn().mockResolvedValue("created");
    expect(
      await withSourceGuard(["https://youtu.be/I2eQDTDm2O0"], true, write),
    ).toBe("created");
  });
});
