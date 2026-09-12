import assert from "node:assert/strict";
import test from "node:test";
import { GET, resetRiderDiscoveryCache } from "../app/api/riders/search/route";
import {
  buildRiderDiscoveryIndex,
  createRiderDiscoverySources,
  isRiderDiscoveryIndex,
  isRiderDiscoveryQueryUsable,
  searchRiderDiscoveryIndex,
  type RiderDiscoverySource,
} from "../lib/riderDiscovery";
import type { MeetEntry, RaceResult, Rider } from "../lib/types";

function meet(meetId: string, meetDate: string, raceId = `race-${meetId}`): MeetEntry {
  return {
    meetId,
    season: "2026",
    meetDate,
    series: "AJOCC",
    meetName: `大会 ${meetId}`,
    categories: [{ raceId, name: "ME1", order: 1 }],
  };
}

function rider(riderId: string, name: string, dataQuality: Rider["dataQuality"] = "ok"): Rider {
  return {
    riderId,
    name,
    finalPosition: 1,
    status: "finished",
    dataQuality,
    laps: [],
  };
}

function race(source: RiderDiscoverySource, riders: Rider[]): RaceResult {
  return {
    raceId: source.category.raceId,
    raceName: source.meet.meetName,
    category: source.category.name,
    updatedAt: source.meet.meetDate,
    riders,
  };
}

function validGeneratedIndex() {
  return {
    version: 1,
    scannedSources: 2,
    failedSources: 1,
    totalSources: 3,
    riders: [{
      riderId: "stable-rider",
      name: "Stable Rider",
      dataQuality: "ok" as const,
      totalAppearances: 1,
      appearances: [{
        meetId: "meet-1",
        meetName: "Meet 1",
        meetDate: "2026-03-01",
        season: "2025-26",
        series: "AJOCC",
        raceId: "race-1",
        categoryId: "race-1",
        categoryName: "ME1",
      }],
    }],
  };
}

test("query threshold counts normalized Unicode code points", () => {
  assert.equal(isRiderDiscoveryQueryUsable("A"), false);
  assert.equal(isRiderDiscoveryQueryUsable(" A "), false);
  assert.equal(isRiderDiscoveryQueryUsable("😀a"), true);
});

test("accepts a valid generated index and rejects missing or malformed source counters", () => {
  assert.equal(isRiderDiscoveryIndex(validGeneratedIndex()), true);

  const boundedGeneratedIndex = validGeneratedIndex();
  boundedGeneratedIndex.riders[0]!.totalAppearances = 7;
  assert.equal(isRiderDiscoveryIndex(boundedGeneratedIndex), true);

  const missingCounters = (["scannedSources", "failedSources", "totalSources"] as const).map((name) => {
    const index = validGeneratedIndex();
    delete (index as Record<string, unknown>)[name];
    return index;
  });
  const malformedIndexes = [
    ...missingCounters,
    { ...validGeneratedIndex(), scannedSources: -1 },
    { ...validGeneratedIndex(), scannedSources: 1.5 },
    { ...validGeneratedIndex(), scannedSources: Number.POSITIVE_INFINITY },
    { ...validGeneratedIndex(), failedSources: 3, scannedSources: 2 },
    { ...validGeneratedIndex(), scannedSources: 4, totalSources: 3 },
    { ...validGeneratedIndex(), scannedSources: 2, failedSources: 0, totalSources: 4 },
  ];

  for (const malformedIndex of malformedIndexes) {
    assert.equal(isRiderDiscoveryIndex(malformedIndex), false);
  }
});

test("rejects empty rider lists and matches without a consistent appearance count", () => {
  const emptyRiderList = { ...validGeneratedIndex(), riders: [] };
  const emptyAppearances = validGeneratedIndex();
  emptyAppearances.riders[0]!.appearances = [];
  const zeroTotalAppearances = validGeneratedIndex();
  zeroTotalAppearances.riders[0]!.totalAppearances = 0;

  assert.equal(isRiderDiscoveryIndex(emptyRiderList), false);
  assert.equal(isRiderDiscoveryIndex(emptyAppearances), false);
  assert.equal(isRiderDiscoveryIndex(zeroTotalAppearances), false);
});

test("rejects duplicate rider IDs across a generated index", () => {
  const duplicateIndex = validGeneratedIndex();
  duplicateIndex.riders.push({ ...duplicateIndex.riders[0]! });

  assert.equal(isRiderDiscoveryIndex(duplicateIndex), false);
});

test("rejects empty or mismatched appearance identity fields", () => {
  const fields = [
    ["riderId", ""],
    ["meetId", ""],
    ["meetDate", ""],
    ["season", ""],
    ["series", ""],
    ["raceId", ""],
    ["categoryId", ""],
    ["raceId", "different-race"],
  ] as const;

  for (const [field, value] of fields) {
    const malformedIndex = validGeneratedIndex();
    if (field === "riderId") {
      malformedIndex.riders[0]!.riderId = value;
    } else {
      malformedIndex.riders[0]!.appearances[0]![field] = value;
    }
    assert.equal(isRiderDiscoveryIndex(malformedIndex), false, `expected ${field} to be rejected`);
  }
});

test("groups strictly by rider ID, matches normalized names/IDs, and preserves quality", async () => {
  const sources = createRiderDiscoverySources([meet("one", "2026-03-02")]);
  const scan = await buildRiderDiscoveryIndex(sources, async (source) =>
    race(source, [
      rider("same-name-1", "Alice", "error"),
      rider("same-name-2", "Alice", "ok"),
    ]),
  );

  const results = searchRiderDiscoveryIndex(scan.index, " alice ");
  assert.deepEqual(results.map((result) => result.riderId), ["same-name-1", "same-name-2"]);
  assert.equal(results[0]?.dataQuality, "error");
  assert.equal(results[0]?.totalAppearances, 1);
  assert.equal(results[0]?.appearances[0]?.categoryId, "race-one");
  assert.equal("href" in (results[0]?.appearances[0] ?? {}), false);
});

test("rejects mismatched race/category payloads and limits appearances to six newest", async () => {
  const meets = Array.from({ length: 8 }, (_, index) =>
    meet(`meet-${index}`, `2026-03-${String(8 - index).padStart(2, "0")}`),
  );
  const sources = createRiderDiscoverySources(meets);
  const scan = await buildRiderDiscoveryIndex(sources, async (source) => {
    if (source.meet.meetId === "meet-0") {
      return { ...race(source, [rider("ignored", "Ignored")]), category: "wrong" };
    }
    return race(source, [rider("long-lived", "Long Lived")]);
  });

  assert.equal(scan.failedSources, 1);
  assert.equal(scan.index.riders[0]?.totalAppearances, 7);
  assert.equal(scan.index.riders[0]?.appearances.length, 6);
  assert.deepEqual(
    scan.index.riders[0]?.appearances.map((appearance) => appearance.meetId),
    ["meet-1", "meet-2", "meet-3", "meet-4", "meet-5", "meet-6"],
  );
});

test("keeps the six newest appearances when fetches resolve out of order", async () => {
  const meets = Array.from({ length: 8 }, (_, index) =>
    meet(`ordered-${index}`, `2026-04-${String(8 - index).padStart(2, "0")}`),
  );
  const sources = createRiderDiscoverySources(meets);
  const scan = await buildRiderDiscoveryIndex(sources, async (source) => {
    if (source.meet.meetId === "ordered-0") {
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    return race(source, [rider("ordered-rider", "Ordered Rider")]);
  }, { concurrency: 8, budgetMs: 500 });

  assert.deepEqual(
    scan.index.riders[0]?.appearances.map((appearance) => appearance.meetId),
    ["ordered-0", "ordered-1", "ordered-2", "ordered-3", "ordered-4", "ordered-5"],
  );
});

test("uses newest appearance metadata for out-of-order renamed or repaired riders", async () => {
  const meets = [
    meet("current", "2026-05-02"),
    meet("legacy", "2026-05-01"),
  ];
  const sources = createRiderDiscoverySources(meets);
  const scan = await buildRiderDiscoveryIndex(sources, async (source) => {
    if (source.meet.meetId === "current") {
      await new Promise((resolve) => setTimeout(resolve, 25));
      return race(source, [rider("stable-id", "Current Name", "ok")]);
    }
    return race(source, [rider("stable-id", "Legacy Name", "error")]);
  }, { concurrency: 2, budgetMs: 500 });

  assert.equal(scan.index.riders[0]?.name, "Current Name");
  assert.equal(scan.index.riders[0]?.dataQuality, "ok");
  assert.equal(searchRiderDiscoveryIndex(scan.index, "current").length, 1);
});

test("scan concurrency is capped and budget produces a partial result", async () => {
  const sources = createRiderDiscoverySources(
    Array.from({ length: 5 }, (_, index) => meet(`slow-${index}`, `2026-02-0${index + 1}`)),
  );
  let active = 0;
  let maximumActive = 0;
  const scan = await buildRiderDiscoveryIndex(sources, async (source) => {
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    await new Promise((resolve) => setTimeout(resolve, 40));
    active -= 1;
    return race(source, [rider("slow-rider", "Slow Rider")]);
  }, { concurrency: 2, budgetMs: 10 });

  assert.equal(maximumActive <= 2, true);
  assert.equal(scan.status, "partial");
});

async function withFetch(implementation: typeof fetch, run: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = implementation;
  resetRiderDiscoveryCache();
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
    resetRiderDiscoveryCache();
  }
}

test("route returns exact short-query and no-store semantics", async () => {
  const response = await GET(new Request("https://example.test/api/riders/search?q=A"));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "query-too-short", retryable: false });
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("route returns exact partial fields without embedded links", async () => {
  const meets = [meet("good", "2026-03-02"), meet("bad", "2026-03-01")];
  await withFetch(async (input) => {
    const url = String(input);
    if (url.endsWith("/meets.json")) return Response.json(meets);
    if (url.includes("race-good")) return Response.json(race(createRiderDiscoverySources([meets[0]!])[0]!, [rider("r-1", "Rider One")]));
    return new Response(null, { status: 500 });
  }, async () => {
    const response = await GET(new Request("https://example.test/api/riders/search?q=rider"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "partial",
      query: "rider",
      results: [{
        riderId: "r-1",
        name: "Rider One",
        dataQuality: "ok",
        totalAppearances: 1,
        appearances: [{
          meetId: "good",
          meetName: "大会 good",
          meetDate: "2026-03-02",
          season: "2026",
          series: "AJOCC",
          raceId: "race-good",
          categoryId: "race-good",
          categoryName: "ME1",
        }],
      }],
      scannedSources: 2,
      failedSources: 1,
      totalSources: 2,
      warning: "source-scan-incomplete",
    });
  });
});

test("route prefers the validated generated historical rider index", async () => {
  const indexedMeet = meet("historical", "2024-12-01", "historical-race");
  await withFetch(async (input) => {
    const url = String(input);
    if (url.endsWith("/rider-index.json")) {
      return Response.json({
        version: 1,
        scannedSources: 3,
        failedSources: 0,
        totalSources: 3,
        riders: [{
          riderId: "historic-rider",
          name: "Historic Rider",
          dataQuality: "ok",
          totalAppearances: 1,
          appearances: [{
            meetId: indexedMeet.meetId,
            meetName: indexedMeet.meetName,
            meetDate: indexedMeet.meetDate,
            season: indexedMeet.season,
            series: indexedMeet.series,
            raceId: "historical-race",
            categoryId: "historical-race",
            categoryName: "ME1",
          }],
        }],
      });
    }
    throw new Error(`unexpected fallback request: ${url}`);
  }, async () => {
    const response = await GET(new Request("https://example.test/api/riders/search?q=historic"));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "complete",
      query: "historic",
      results: [{
        riderId: "historic-rider",
        name: "Historic Rider",
        dataQuality: "ok",
        totalAppearances: 1,
        appearances: [{
          meetId: indexedMeet.meetId,
          meetName: indexedMeet.meetName,
          meetDate: indexedMeet.meetDate,
          season: indexedMeet.season,
          series: indexedMeet.series,
          raceId: "historical-race",
          categoryId: "historical-race",
          categoryName: "ME1",
        }],
      }],
      scannedSources: 3,
      failedSources: 0,
      totalSources: 3,
    });
  });
});

test("route falls back to bounded race scanning for a malformed generated index", async () => {
  const fallbackMeet = meet("fallback", "2026-03-03");
  let indexRequests = 0;
  let meetRequests = 0;
  const duplicateIndex = validGeneratedIndex();
  duplicateIndex.riders.push({ ...duplicateIndex.riders[0]! });
  await withFetch(async (input) => {
    const url = String(input);
    if (url.endsWith("/rider-index.json")) {
      indexRequests += 1;
      return Response.json(duplicateIndex);
    }
    if (url.endsWith("/meets.json")) {
      meetRequests += 1;
      return Response.json([fallbackMeet]);
    }
    return Response.json(race(createRiderDiscoverySources([fallbackMeet])[0]!, [rider("fallback-rider", "Fallback Rider")]));
  }, async () => {
    const response = await GET(new Request("https://example.test/api/riders/search?q=fallback"));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).results[0]?.riderId, "fallback-rider");
  });
  assert.equal(indexRequests, 1);
  assert.equal(meetRequests, 1);
});

test("route falls back when the generated index has required-counter or appearance-shape violations", async () => {
  const malformedIndexes = [
    (() => {
      const index = validGeneratedIndex();
      delete (index as Record<string, unknown>).scannedSources;
      return index;
    })(),
    { ...validGeneratedIndex(), scannedSources: 1.5 },
    { ...validGeneratedIndex(), riders: [] },
    (() => {
      const index = validGeneratedIndex();
      index.riders[0]!.appearances = [];
      return index;
    })(),
    (() => {
      const index = validGeneratedIndex();
      index.riders[0]!.totalAppearances = 0;
      return index;
    })(),
  ];

  for (const [index, malformedIndex] of malformedIndexes.entries()) {
    const fallbackMeet = meet(`shape-fallback-${index}`, `2026-03-${String(index + 1).padStart(2, "0")}`);
    await withFetch(async (input) => {
      const url = String(input);
      if (url.endsWith("/rider-index.json")) return Response.json(malformedIndex);
      if (url.endsWith("/meets.json")) return Response.json([fallbackMeet]);
      return Response.json(race(createRiderDiscoverySources([fallbackMeet])[0]!, [rider("shape-fallback-rider", "Shape Fallback Rider")]));
    }, async () => {
      const response = await GET(new Request("https://example.test/api/riders/search?q=shape-fallback"));
      assert.equal(response.status, 200);
      assert.equal((await response.json()).results[0]?.riderId, "shape-fallback-rider");
    });
  }
});

test("route returns retryable 503 when every race source fails", async () => {
  await withFetch(async (input) => {
    if (String(input).endsWith("/meets.json")) return Response.json([meet("unavailable", "2026-03-02")]);
    return new Response(null, { status: 503 });
  }, async () => {
    const response = await GET(new Request("https://example.test/api/riders/search?q=un"));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "source-unavailable", retryable: true });
  });
});
