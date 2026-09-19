import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const { findUnique, update, authenticate } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  authenticate: vi.fn(),
}));
vi.mock("@/database/prisma", () => ({
  default: { sketch: { findUnique, update } },
}));
vi.mock("@/backend/api/apiAuth", () => ({
  authenticateApiRequest: authenticate,
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
  handleApiError: (error: { status?: number; message: string }) =>
    Response.json({ error: error.message }, { status: error.status ?? 400 }),
}));
import { PUT } from "../app/api/sketches/[id]/review-status/route";

beforeEach(() => {
  vi.resetAllMocks();
  authenticate.mockResolvedValue({ id: "editor" });
  findUnique.mockResolvedValue({
    id: 694,
    review_status: "NeedsReview",
    flag_note: "Keep note",
  });
  update.mockResolvedValue({ id: 694 });
});

function put(body: unknown) {
  return PUT(
    new NextRequest("http://localhost/api/sketches/694/review-status", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id: "694" }) },
  );
}

test.each([
  { review_status: "NeedsReview" },
  { review_status: "NeedsReview", flag_note: "Keep note" },
])("repeated status leaves audit metadata untouched: %j", async (body) => {
  const result = await put(body);
  expect(result.status).toBe(200);
  expect(await result.json()).toEqual({
    id: 694,
    review_status: "NeedsReview",
  });
  expect(update).not.toHaveBeenCalled();
});

test.each(["Changed note", null])(
  "same status still permits an explicit note change to %j",
  async (flag_note) => {
    expect(
      (await put({ review_status: "NeedsReview", flag_note })).status,
    ).toBe(200);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flag_note,
          modified_by_id: "editor",
          modified_at: expect.any(Date),
        }),
      }),
    );
  },
);

test("a real status transition is saved, preserving an omitted note", async () => {
  findUnique.mockResolvedValue({
    id: 694,
    review_status: "Reviewed",
    flag_note: "Keep note",
  });
  expect((await put({ review_status: "NeedsReview" })).status).toBe(200);
  const data = update.mock.calls[0][0].data;
  expect(data.review_status).toBe("NeedsReview");
  expect(data).not.toHaveProperty("flag_note");
});

test("missing sketches and unauthorized callers cannot write", async () => {
  findUnique.mockResolvedValue(null);
  expect((await put({ review_status: "NeedsReview" })).status).toBe(404);
  authenticate.mockRejectedValue(
    Object.assign(new Error("Unauthorized"), { status: 401 }),
  );
  expect((await put({ review_status: "NeedsReview" })).status).toBe(401);
  expect(update).not.toHaveBeenCalled();
});
