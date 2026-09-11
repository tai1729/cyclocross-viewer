import assert from "node:assert/strict";
import test from "node:test";
import { fetchRaceResult } from "../lib/dataSource";
import {
  buildGapSeries,
  getRaceLapCount,
  getRaceLapNumbers,
  getRiderResult,
} from "../lib/dataTransform";
import type { LapRecord, RaceResult, Rider } from "../lib/types";

function lap(lapNumber: number, cumulativeTimeSec: number, rankAtLap = 1): LapRecord {
  return {
    lapNumber,
    lapTimeSec: lapNumber === 1 ? cumulativeTimeSec : 300,
    cumulativeTimeSec,
    rankAtLap,
  };
}

function rider(
  riderId: string,
  finalPosition: number,
  laps: LapRecord[],
  status: Rider["status"] = "finished",
): Rider {
  return { riderId, name: riderId, finalPosition, status, laps, dataQuality: "ok" };
}

function race(
  raceId: string,
  riders: Rider[],
  raceLapNumbers?: number[],
): RaceResult {
  return {
    raceId,
    raceName: raceId,
    category: "E1",
    updatedAt: "2026-09-12T00:00:00Z",
    ...(raceLapNumbers === undefined ? {} : { raceLapNumbers }),
    riders,
  };
}

test("B-02 CCS-256-003 keeps the official 11-lap axis and final checkpoint", () => {
  const leaderLaps = Array.from({ length: 11 }, (_, index) => lap(index + 1, (index + 1) * 300));
  const lapDownLaps = leaderLaps.slice(0, 10);
  const result = race("27834", [
    rider("KNS-167-0031", 1, leaderLaps),
    rider("lap-down", 2, lapDownLaps),
  ], Array.from({ length: 11 }, (_, index) => index + 1));

  assert.equal(getRaceLapCount(result), 11);
  assert.deepEqual(getRaceLapNumbers(result), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(getRiderResult(result, "lap-down")?.kind, "lapped");
  const lapDownResult = getRiderResult(result, "lap-down");
  assert.equal(lapDownResult?.kind, "lapped");
  if (lapDownResult?.kind === "lapped") assert.equal(lapDownResult.lapDeficit, 1);
});

test("B-03 KNS-256-010 preserves the official 1..11 axis when measured columns begin at lap 2", () => {
  const measuredLaps = Array.from({ length: 10 }, (_, index) => lap(index + 2, (index + 1) * 360));
  const result = race("27770", [rider("CCM-000-1602", 1, measuredLaps)], Array.from({ length: 11 }, (_, index) => index + 1));

  assert.equal(getRaceLapCount(result), 11);
  assert.deepEqual(getRaceLapNumbers(result), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(measuredLaps.map((item) => item.lapNumber), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
});

test("B-04 KNS-256-011 keeps P2 gap points across the official lap sequence", () => {
  const leader = rider("KNS-000-1252", 1, [
    lap(2, 872.2), lap(3, 1293.2), lap(4, 1713.7), lap(5, 2140.1),
    lap(6, 2569.5), lap(7, 3008.4), lap(8, 3455.4),
  ]);
  const second = rider("KNS-000-2145", 2, [
    lap(2, 873.1), lap(3, 1309.2), lap(4, 1734.3), lap(5, 2164.2),
    lap(6, 2597), lap(7, 3032.3), lap(8, 3460.3),
  ]);
  const result = race("27160", [leader, second], [1, 2, 3, 4, 5, 6, 7, 8]);
  const gapPoints = buildGapSeries(result, leader.riderId, [second.riderId]);

  assert.deepEqual(gapPoints.map((point) => point.lapNumber), [1, 2, 3, 4, 5, 6, 7, 8]);
  const measuredGaps = gapPoints
    .filter((point) => second.riderId in point)
    .map((point) => point[second.riderId]);
  assert.equal(measuredGaps.length, 7);
  assert.ok(Math.abs(measuredGaps[0] - 0.9) < 1e-9);
  assert.ok(Math.abs(measuredGaps.at(-1)! - 4.9) < 1e-9);
});

test("a finite zero gap remains a measured value instead of a missing point", () => {
  const leader = rider("leader", 1, [lap(1, 60), lap(2, 120)]);
  const peer = rider("peer", 2, [lap(1, 60), lap(2, 120)]);
  const points = buildGapSeries(race("zero-gap", [leader, peer]), "leader", ["peer"]);

  assert.deepEqual(points, [
    { lapNumber: 1, peer: 0 },
    { lapNumber: 2, peer: 0 },
  ]);
});

test("official lap metadata is all-or-nothing and never fabricates measurements", () => {
  const measured = rider("leader", 1, [lap(1, 60), lap(2, 120), lap(5, 300)]);
  for (const malformed of [
    [],
    [1, 3, 3],
    [3, 2],
    [1, Number.NaN],
    [1, Number.POSITIVE_INFINITY],
    [1, 1.5],
    [1, Number.MAX_SAFE_INTEGER + 1],
  ]) {
    const result = race("generic", [measured], malformed as unknown as number[]);

    assert.deepEqual(getRaceLapNumbers(result), [1, 2, 5]);
  }
});

test("malformed lap metadata is accepted at the data boundary", async () => {
  const payload = race("generic", [rider("leader", 1, [lap(1, 60)])], [2, 1]);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(payload);

  try {
    const result = await fetchRaceResult("https://example.invalid/race.json");
    assert.equal(result.raceLapNumbers, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
