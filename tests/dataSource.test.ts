import assert from "node:assert/strict";
import test from "node:test";
import {
  DataLoadError,
  describeDataLoadError,
  fetchRaceResult,
} from "../lib/dataSource";

async function withFetch(
  implementation: typeof fetch,
  run: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = implementation;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function assertErrorKind(
  implementation: typeof fetch,
  expectedKind: DataLoadError["kind"],
): Promise<void> {
  await withFetch(implementation, async () => {
    await assert.rejects(
      () => fetchRaceResult("https://example.invalid/race.json"),
      (error: unknown) =>
        error instanceof DataLoadError && error.kind === expectedKind,
    );
  });
}

test("HTTP 404をnot-foundとして区別する", async () => {
  await assertErrorKind(
    async () => new Response(null, { status: 404 }),
    "not-found",
  );
});

test("HTTP 500をhttp errorとして区別する", async () => {
  await assertErrorKind(
    async () => new Response(null, { status: 500 }),
    "http",
  );
});

test("通信失敗をnetwork errorとして区別する", async () => {
  await assertErrorKind(
    async () => {
      throw new TypeError("failed to fetch");
    },
    "network",
  );
});

test("壊れたJSONと最低限のshape不正をinvalid-dataとして区別する", async () => {
  await assertErrorKind(
    async () => new Response("{", { status: 200 }),
    "invalid-data",
  );
  await assertErrorKind(
    async () => Response.json({ raceId: "missing-fields" }),
    "invalid-data",
  );
});

test("取得エラーの種類ごとに異なる説明を返す", () => {
  const descriptions = [
    describeDataLoadError(new DataLoadError("not-found", ""), "レース"),
    describeDataLoadError(new DataLoadError("network", ""), "レース"),
    describeDataLoadError(new DataLoadError("http", "", 500), "レース"),
    describeDataLoadError(new DataLoadError("invalid-data", ""), "レース"),
  ];

  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.match(descriptions[0], /見つかりません/);
  assert.match(descriptions[1], /通信/);
  assert.match(descriptions[2], /500/);
  assert.match(descriptions[3], /形式/);
});
