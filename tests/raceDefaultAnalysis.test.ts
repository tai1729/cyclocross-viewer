import assert from "node:assert/strict";
import test from "node:test";
import type { LapRecord, Rider } from "@/lib/types";
import {
  canAutoSelectDefaultRider,
  getFirstGraphableRider,
} from "@/lib/raceDefaultAnalysis";

const checkpoint: LapRecord = {
  lapNumber: 1,
  lapTimeSec: 60,
  cumulativeTimeSec: 60,
  rankAtLap: 1,
};

function rider(
  riderId: string,
  finalPosition: number,
  overrides: Partial<Rider> = {},
): Rider {
  return {
    riderId,
    name: riderId,
    finalPosition,
    status: "finished",
    laps: [checkpoint],
    dataQuality: "ok",
    ...overrides,
  };
}

test("first graphable rider follows displayed final-position order with stable ties", () => {
  const first = rider("first", 2, { dataQuality: "error" });
  const tiedGraphable = rider("tied-graphable", 2);
  const later = rider("later", 3);

  assert.equal(getFirstGraphableRider([later, first, tiedGraphable])?.riderId, "tied-graphable");
});

test("graphable DNF and lapped riders remain eligible", () => {
  const dnf = rider("dnf", 4, { status: "dnf" });
  const lapped = rider("lapped", 5);

  assert.equal(getFirstGraphableRider([lapped, dnf])?.riderId, "dnf");
});

test("returns null when no rider has valid graph data", () => {
  assert.equal(
    getFirstGraphableRider([
      rider("bad-quality", 1, { dataQuality: "error" }),
      rider("no-checkpoints", 2, { laps: [] }),
    ]),
    null,
  );
});

test("explicit rider provenance blocks default selection after canonicalization", () => {
  assert.equal(canAutoSelectDefaultRider("explicit"), false);
});

test("fresh entry remains eligible for default selection", () => {
  assert.equal(canAutoSelectDefaultRider("fresh"), true);
});

test("category reset re-enables default selection", () => {
  assert.equal(canAutoSelectDefaultRider("category-reset"), true);
});
