import assert from "node:assert/strict";
import test from "node:test";
import {
  getComparisonRiders,
  MAX_ALL_COMPARISON_RIDERS,
  MAX_PINNED_COMPARISON_RIDERS,
  MAX_PINNED_FIXED_RIDERS,
} from "../hooks/useComparisonRiders";
import type { Rider } from "../lib/types";

function rider(riderId: string, finalPosition: number): Rider {
  return {
    riderId,
    name: riderId,
    finalPosition,
    status: "finished",
    laps: [],
    dataQuality: "ok",
  };
}

function ids(selected: Rider[]): string[] {
  return selected.map((selectedRider) => selectedRider.riderId);
}

const riders = [
  rider("r3", 3),
  rider("r1", 1),
  rider("r5", 5),
  rider("r2", 2),
  rider("r4", 4),
  rider("r6", 6),
];

test("numeric presets preserve rank-neighbor selection", () => {
  assert.deepEqual(ids(getComparisonRiders(riders, "r3", 0)), ["r3"]);
  assert.deepEqual(ids(getComparisonRiders(riders, "r3", 2)), ["r1", "r2", "r3", "r4", "r5"]);
  assert.deepEqual(ids(getComparisonRiders(riders, "r3", 5)), ["r1", "r2", "r3", "r4", "r5", "r6"]);
});

test("pinned mode returns the primary first", () => {
  assert.deepEqual(ids(getComparisonRiders(riders, "r3", "pinned", [])), ["r3"]);
  assert.equal(MAX_PINNED_COMPARISON_RIDERS, 5);
  assert.equal(MAX_PINNED_FIXED_RIDERS, 4);
});

test("pinned mode filters, sorts, deduplicates, and caps fixed riders", () => {
  assert.deepEqual(
    ids(
      getComparisonRiders(riders, "r3", "pinned", [
        "r6",
        "missing",
        "r1",
        "r4",
        "r2",
        "r5",
        "r2",
        "r3",
        "",
      ]),
    ),
    ["r3", "r1", "r2", "r4", "r5"],
  );
});

test("pinned mode breaks equal final-position ties by rider ID", () => {
  const tiedRiders = [...riders, rider("r7", 4), rider("r0", 4)];

  assert.deepEqual(
    ids(getComparisonRiders(tiedRiders, "r3", "pinned", ["r7", "r0", "r1", "r2"])),
    ["r3", "r1", "r2", "r0", "r7"],
  );
});

test("all mode returns every supplied rider and keeps its cap constant", () => {
  assert.deepEqual(ids(getComparisonRiders(riders, "r3", "all")), ["r1", "r2", "r3", "r4", "r5", "r6"]);
  assert.equal(MAX_ALL_COMPARISON_RIDERS, 8);
});

test("missing or non-graphable primary produces no comparison riders", () => {
  assert.deepEqual(ids(getComparisonRiders(riders, null, "pinned", ["r1"])), []);
  assert.deepEqual(ids(getComparisonRiders(riders, "not-graphable", "pinned", ["r1"])), []);
});
