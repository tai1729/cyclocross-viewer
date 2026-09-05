import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeHomeUrlState,
  normalizeRaceUrlState,
  parseHomeUrlState,
  parseRaceUrlState,
  serializeRaceUrlState,
  updateRaceCategoryQuery,
  updateUrlQuery,
} from "../lib/urlState";
import type { LapRecord, MeetCategory, Rider } from "../lib/types";

function rider(riderId: string, dataQuality: Rider["dataQuality"] = "ok", laps: LapRecord[] = [{ lapNumber: 1, lapTimeSec: 60, cumulativeTimeSec: 60, rankAtLap: 1 }]): Rider {
  return { riderId, name: riderId, finalPosition: 1, status: "finished", laps, dataQuality };
}

const categories: MeetCategory[] = [
  { raceId: "cat-2", name: "second", order: 2 },
  { raceId: "cat-1", name: "first", order: 1 },
];

test("parsing defaults is total for empty and throwing URL-like inputs", () => {
  assert.deepEqual(parseRaceUrlState(""), {
    season: "", series: "", category: "", rider: "", compare: 2, fixed: [], tab: "rank", lap: null, unknownParams: [],
  });
  assert.doesNotThrow(() => parseRaceUrlState({ entries() { throw new Error("bad query"); } }));
  assert.deepEqual(parseRaceUrlState({ entries() { throw new Error("bad query"); } }), parseRaceUrlState(""));
});

test("malformed and invalid scalar values safely use defaults", () => {
  const state = parseRaceUrlState("compare=6&tab=chart&lap=0&rider=&fixed=&fixed=r1&broken=%E0%A4%A");
  assert.equal(state.compare, 2);
  assert.equal(state.tab, "rank");
  assert.equal(state.lap, null);
  assert.deepEqual(state.fixed, ["r1"]);
  assert.deepEqual(state.unknownParams, []);
});

test("normalization resolves category order, stale riders, fixed IDs, and limits", () => {
  const state = normalizeRaceUrlState(
    parseRaceUrlState("category=missing&rider=unavailable&compare=pinned&fixed=r2&fixed=stale&fixed=r2&fixed=r3&fixed=r4&fixed=r5&fixed=r6"),
    {
      categories,
      riders: [rider("unavailable", "error"), rider("r2"), rider("r3"), rider("r4"), rider("r5"), rider("r6")],
      graphableRiderIds: ["r2", "r3", "r4", "r5", "r6"],
      lapNumbers: [1, 2],
    },
  );
  assert.equal(state.category, "");
  assert.equal(state.selectedCategoryId, "cat-1");
  assert.equal(state.rider, "unavailable");
  assert.deepEqual(state.fixed, ["r2", "r3", "r4", "r5"]);
});

test("all falls back above the graphable limit while pinned may have no fixed riders", () => {
  const all = normalizeRaceUrlState(parseRaceUrlState("compare=all"), {
    categories,
    riders: Array.from({ length: 9 }, (_, index) => rider(`r${index}`)),
    graphableRiderIds: Array.from({ length: 9 }, (_, index) => `r${index}`),
    lapNumbers: [1],
  });
  assert.equal(all.compare, 2);

  const pinned = normalizeRaceUrlState(parseRaceUrlState("compare=pinned&fixed=stale"), {
    categories,
    riders: [rider("r1")],
    graphableRiderIds: ["r1"],
    lapNumbers: [1],
  });
  assert.equal(pinned.compare, "pinned");
  assert.deepEqual(pinned.fixed, []);
});

test("lap normalization uses only the supplied race axis", () => {
  const valid = normalizeRaceUrlState(parseRaceUrlState("lap=3"), { categories, riders: [], lapNumbers: [1, 3] });
  const invalid = normalizeRaceUrlState(parseRaceUrlState("lap=2"), { categories, riders: [], lapNumbers: [1, 3] });
  const empty = normalizeRaceUrlState(parseRaceUrlState("lap=1"), { categories, riders: [], lapNumbers: [] });
  assert.equal(valid.lap, 3);
  assert.equal(invalid.lap, null);
  assert.equal(empty.lap, null);
});

test("Home normalization validates season and series together", () => {
  const meets = [
    { season: "2024", series: "A" },
    { season: "2025", series: "B" },
  ] as const;
  assert.deepEqual(normalizeHomeUrlState(parseHomeUrlState("season=2024&series=B"), meets), {
    season: "2024", series: "", unknownParams: [],
  });
  assert.deepEqual(normalizeHomeUrlState(parseHomeUrlState("season=nope&series=B"), meets), {
    season: "", series: "B", unknownParams: [],
  });
  assert.deepEqual(normalizeHomeUrlState(parseHomeUrlState("series=A"), meets), {
    season: "", series: "A", unknownParams: [],
  });
});

test("serialization has deterministic known-key order and omits defaults", () => {
  const query = serializeRaceUrlState({
    season: "2025", series: "A", category: "cat-2", rider: "r1", compare: "pinned",
    fixed: ["r3", "r2"], tab: "lap", lap: 3, unknownParams: [["z", "1"], ["z", "2"]],
  });
  assert.equal(query, "season=2025&series=A&category=cat-2&rider=r1&compare=pinned&fixed=r3&fixed=r2&tab=lap&lap=3&z=1&z=2");
  assert.equal(serializeRaceUrlState({ ...parseRaceUrlState("compare=2&fixed=r1&tab=rank"), unknownParams: [] }), "");
});

test("query updates preserve unknown repeated pairs after known keys", () => {
  const updated = updateUrlQuery("x=first&fixed=r2&x=second&compare=pinned&fixed=r1", { rider: "r3", fixed: ["r4"] });
  assert.equal(updated, "rider=r3&compare=pinned&fixed=r4&x=first&x=second");
});

test("category-only canonicalization preserves raw dependent query values", () => {
  const updated = updateRaceCategoryQuery(
    "x=first&category=missing&rider=stale&compare=invalid&fixed=stale&tab=invalid&lap=not-a-lap&x=second",
    "cat-1",
  );
  assert.equal(
    updated,
    "category=cat-1&rider=stale&compare=invalid&fixed=stale&tab=invalid&lap=not-a-lap&x=first&x=second",
  );
});
