import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

type UpdateArgs = {
  where: { id: number; google_indexing_requested_at: null | { not: null } };
  data: {
    google_indexing_requested_at: Date | null;
    modified_by_id: string;
    modified_at: Date;
  };
};

const { findUnique, updateMany, findMany, count, authenticate } = vi.hoisted(
  () => ({
    findUnique: vi.fn(),
    updateMany: vi.fn<(args: UpdateArgs) => Promise<{ count: number }>>(),
    findMany: vi.fn(),
    count: vi.fn(),
    authenticate: vi.fn(),
  }),
);
vi.mock("@/database/prisma", () => ({
  default: { sketch: { findUnique, updateMany, findMany, count } },
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
import { GET, PUT } from "../app/api/indexing/[id]/route";
import { GET as queue } from "../app/api/indexing/unrequested/route";

let row: { id: number; google_indexing_requested_at: Date | null } | null;
beforeEach(() => {
  vi.resetAllMocks();
  row = { id: 694, google_indexing_requested_at: null };
  authenticate.mockResolvedValue({ id: "editor" });
  findUnique.mockImplementation(() => Promise.resolve(row));
  updateMany.mockImplementation(({ where, data }) => {
    const matches =
      row &&
      (where.google_indexing_requested_at === null
        ? row.google_indexing_requested_at === null
        : row.google_indexing_requested_at !== null);
    if (matches && row)
      row.google_indexing_requested_at = data.google_indexing_requested_at;
    return Promise.resolve({ count: matches ? 1 : 0 });
  });
  findMany.mockResolvedValue([
    { id: 694, title: "Test sketch", url_slug: "test-sketch" },
  ]);
  count.mockResolvedValue(12);
});
function put(body: unknown, id = "694") {
  return PUT(
    new NextRequest(`http://localhost/api/indexing/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ id }) },
  );
}
test("mark, retry, read and clear a confirmed request", async () => {
  const first: unknown = await (
    await put({ google_indexing_requested: true })
  ).json();
  expect(first).toEqual({
    id: 694,
    google_indexing_requested_at: expect.any(String) as unknown,
  });
  expect(updateMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { id: 694, google_indexing_requested_at: null },
      data: expect.objectContaining({ modified_by_id: "editor" }) as unknown,
    }),
  );
  const original = new Date("2026-10-01T00:00:00Z");
  row!.google_indexing_requested_at = original;
  expect(await (await put({ google_indexing_requested: true })).json()).toEqual(
    { id: 694, google_indexing_requested_at: original.toISOString() },
  );
  const read = await GET(new NextRequest("http://localhost/api/indexing/694"), {
    params: Promise.resolve({ id: "694" }),
  });
  expect(await read.json()).toEqual({
    id: 694,
    google_indexing_requested_at: original.toISOString(),
  });
  expect(
    await (await put({ google_indexing_requested: false })).json(),
  ).toEqual({ id: 694, google_indexing_requested_at: null });
  expect(
    await (await put({ google_indexing_requested: false })).json(),
  ).toEqual({ id: 694, google_indexing_requested_at: null });
});
test.each([
  {},
  { google_indexing_requested: "true" },
  { google_indexing_requested: true, unexpected: 1 },
])("reject invalid input %j before writing", async (body) => {
  expect((await put(body)).status).toBe(400);
  expect(updateMany).not.toHaveBeenCalled();
});
test.each(["1junk", "0", "-1", "1.5", "9007199254740992"])(
  "reject invalid ID %s",
  async (id) => {
    expect((await put({ google_indexing_requested: true }, id)).status).toBe(
      400,
    );
    expect(updateMany).not.toHaveBeenCalled();
  },
);
test("reject unauthorized writes and return 404 for missing sketches", async () => {
  authenticate.mockRejectedValueOnce(
    Object.assign(new Error("Unauthorized"), { status: 401 }),
  );
  expect((await put({ google_indexing_requested: true })).status).toBe(401);
  expect(updateMany).not.toHaveBeenCalled();
  row = null;
  expect((await put({ google_indexing_requested: true })).status).toBe(404);
  expect(
    (
      await GET(new NextRequest("http://localhost/api/indexing/694"), {
        params: Promise.resolve({ id: "694" }),
      })
    ).status,
  ).toBe(404);
});
test("reject malformed JSON before writing", async () => {
  const result = await PUT(
    new NextRequest("http://localhost/api/indexing/694", {
      method: "PUT",
      body: "{",
    }),
    { params: Promise.resolve({ id: "694" }) },
  );
  expect(result.status).toBe(400);
  expect(updateMany).not.toHaveBeenCalled();
});
test("queue returns canonical URLs, excludes flagged/marked sketches and uses bounded newest-first ordering", async () => {
  const result = await queue(
    new NextRequest("http://localhost/api/indexing/unrequested?limit=2"),
  );
  const body: unknown = await result.json();
  expect(body).toMatchObject({
    total: 12,
    limit: 2,
    sketches: [
      { id: 694, url: "https://www.sketchtv.lol/sketches/test-sketch" },
    ],
  });
  expect(findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        google_indexing_requested_at: null,
        review_status: { not: "Flagged" },
      },
      take: 2,
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
    }),
  );
  expect(count).toHaveBeenCalledWith({
    where: {
      google_indexing_requested_at: null,
      review_status: { not: "Flagged" },
    },
  });
});
test.each(["0", "101", "no", "1.5"])(
  "queue rejects invalid limit %s",
  async (limit) => {
    expect(
      (
        await queue(
          new NextRequest(
            `http://localhost/api/indexing/unrequested?limit=${limit}`,
          ),
        )
      ).status,
    ).toBe(400);
    expect(findMany).not.toHaveBeenCalled();
  },
);
