import assert from "node:assert/strict";
import test from "node:test";
import { matchesRiderSearch } from "../components/RaceResultsTable";
import type { Rider } from "../lib/types";

function sample(overrides: Partial<Rider> = {}): Rider {
  return {
    riderId: "ABC-123",
    name: "山田 太郎",
    finalPosition: 1,
    status: "finished",
    dataQuality: "ok",
    laps: [],
    ...overrides,
  };
}

test("result-table rider filter matches normalized names and IDs without changing empty-query rows", () => {
  const rider = sample();

  assert.equal(matchesRiderSearch(rider, ""), true);
  assert.equal(matchesRiderSearch(rider, "  山田　太郎 "), true);
  assert.equal(matchesRiderSearch(rider, "abc-123"), true);
  assert.equal(matchesRiderSearch(rider, "別の選手"), false);
});
