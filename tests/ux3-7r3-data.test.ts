import assert from "node:assert/strict";
import test from "node:test";
import { isValidElement, type ReactElement } from "react";
import { LineChart } from "recharts";
import { GapChart } from "../components/GapChart";
import { buildRiderSeriesStyles } from "../lib/chartSeriesStyles";
import { fetchRaceResult } from "../lib/dataSource";
import {
  buildGapSeries,
  getRaceLapCount,
  getRaceLapNumbers,
  getRiderResult,
} from "../lib/dataTransform";
import type { LapRecord, RaceResult, Rider } from "../lib/types";

type ChartDataElement = ReactElement<{
  data?: Array<{ lapNumber: number; [riderId: string]: number | undefined }>;
}>;

function findNestedElement(node: unknown, targetType: unknown): ChartDataElement | undefined {
  if (!isValidElement(node)) return undefined;
  if (node.type === targetType) return node as ChartDataElement;

  const children = (node.props as { children?: unknown }).children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const match = findNestedElement(child, targetType);
    if (match) return match;
  }

  return undefined;
}

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

test("B-04 KNS-256-011 passes the reconciled XAxis to the P2 gap series", () => {
  const leader = rider("KNS-000-1252", 1, [
    lap(2, 872.2), lap(3, 1293.2), lap(4, 1713.7), lap(5, 2140.1),
    lap(6, 2569.5), lap(7, 3008.4), lap(8, 3455.4),
  ]);
  const second = rider("KNS-000-2145", 2, [
    lap(2, 873.1), lap(3, 1309.2), lap(4, 1734.3), lap(5, 2164.2),
    lap(6, 2597), lap(7, 3032.3), lap(8, 3460.3),
  ]);
  const result = race("27160", [leader, second], [1, 2, 3, 4, 5, 6, 7, 8]);
  const reconciledXAxisLapNumbers = getRaceLapNumbers(result);
  const gapPoints = buildGapSeries(
    result,
    leader.riderId,
    [second.riderId],
    reconciledXAxisLapNumbers,
  );

  assert.deepEqual(reconciledXAxisLapNumbers, [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(gapPoints.map((point) => point.lapNumber), reconciledXAxisLapNumbers);
  const p2Gaps = gapPoints.map((point) => point[second.riderId] ?? null);
  assert.deepEqual(
    p2Gaps.map((gap) => (gap === null ? null : Number(gap.toFixed(1)))),
    [null, 0.9, 16, 20.6, 24.1, 27.5, 23.9, 4.9],
  );
});

test("B-04 render payload keeps the official P2 lap-2 gap", () => {
  const baseRider = rider("KNS-000-1252", 1, [
    lap(2, 872.2), lap(3, 1293.2), lap(4, 1713.7), lap(5, 2140.1),
    lap(6, 2569.5), lap(7, 3008.4), lap(8, 3455.4),
  ]);
  const targetRider = rider("KNS-000-2145", 2, [
    lap(2, 873.1), lap(3, 1309.2), lap(4, 1734.3), lap(5, 2164.2),
    lap(6, 2597), lap(7, 3032.3), lap(8, 3460.3),
  ]);
  const result = race("27160", [baseRider, targetRider], [1, 2, 3, 4, 5, 6, 7, 8]);
  const raceLapNumbers = getRaceLapNumbers(result);
  const rendered = GapChart({
    race: result,
    baseRider,
    otherRiders: [targetRider],
    seriesStyles: buildRiderSeriesStyles(result.riders, baseRider.riderId, []),
    riderNames: {
      [baseRider.riderId]: baseRider.name,
      [targetRider.riderId]: targetRider.name,
    },
    isCrowded: false,
    raceLapNumbers,
  });
  const chart = findNestedElement(rendered, LineChart);
  assert.ok(chart, "GapChart should render a nested Recharts LineChart");
  const data = chart.props.data;
  assert.ok(data, "LineChart should receive rendered chart data");

  assert.deepEqual(data.map((point) => point.lapNumber), [1, 2, 3, 4, 5, 6, 7, 8]);
  const targetId = targetRider.riderId;
  assert.ok(targetId in data[1], "rendered lap 2 must include the P2 field");
  const expectedGaps: Array<number | null> = [null, 0.9, 16, 20.6, 24.1, 27.5, 23.9, 4.9];
  for (const [index, expected] of expectedGaps.entries()) {
    const actual: number | null = data[index][targetId] ?? null;
    if (expected === null) {
      assert.equal(actual, null);
    } else {
      if (actual === null) assert.fail(`lap ${index + 1} gap is missing`);
      assert.ok(Math.abs(actual - expected) < 1e-9, `lap ${index + 1} gap ${actual} differs from ${expected}`);
    }
  }
});

test("a finite zero gap remains a measured value instead of a missing point", () => {
  const leader = rider("leader", 1, [lap(1, 60), lap(2, 120)]);
  const peer = rider("peer", 2, [lap(1, 60), lap(2, 120)]);
  const zeroGapRace = race("zero-gap", [leader, peer], [1, 2]);
  const points = buildGapSeries(zeroGapRace, "leader", ["peer"], [1, 2]);

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
