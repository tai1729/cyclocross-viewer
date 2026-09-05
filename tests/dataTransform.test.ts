import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGapSeries,
  buildPaceDeltaSeries,
  getRaceLapNumbers,
  getRiderResult,
  getValidCheckpoints,
  getValidTimedLaps,
} from "../lib/dataTransform";
import type { LapRecord, RaceResult, Rider } from "../lib/types";

function lap(
  lapNumber: number,
  lapTimeSec: number,
  cumulativeTimeSec: number,
  rankAtLap = 1,
): LapRecord {
  return { lapNumber, lapTimeSec, cumulativeTimeSec, rankAtLap };
}

function rider(
  riderId: string,
  finalPosition: number,
  laps: LapRecord[],
  status: Rider["status"] = "finished",
  dataQuality: Rider["dataQuality"] = "ok",
): Rider {
  return { riderId, name: riderId, finalPosition, status, laps, dataQuality };
}

function race(riders: Rider[]): RaceResult {
  return {
    raceId: "test",
    raceName: "test race",
    category: "ME1",
    updatedAt: "2026-09-03T00:00:00Z",
    riders,
  };
}

test("gapとpaceは配列位置ではなく同じlapNumberだけを比較する", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(2, 62, 122),
    lap(3, 64, 186),
  ]);
  const target = rider("target", 2, [lap(2, 65, 130), lap(3, 66, 196)]);
  const data = race([base, target]);

  assert.deepEqual(buildGapSeries(data, "base", ["target"]), [
    { lapNumber: 1 },
    { lapNumber: 2, target: 8 },
    { lapNumber: 3, target: 10 },
  ]);
  assert.deepEqual(buildPaceDeltaSeries(data, "base", ["target"]), [
    { lapNumber: 1 },
    { lapNumber: 2 },
    { lapNumber: 3, target: 2 },
  ]);
});

test("中間欠損は補完せず、前後の有効な値だけを残す", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(2, 60, 120),
    lap(3, 60, 180),
  ]);
  const target = rider("target", 2, [lap(1, 61, 61), lap(3, 63, 184)]);

  assert.deepEqual(buildGapSeries(race([base, target]), "base", ["target"]), [
    { lapNumber: 1, target: 1 },
    { lapNumber: 2 },
    { lapNumber: 3, target: 4 },
  ]);
});

test("2周目から始まる最初の記録はcheckpointには使い、lap/paceから除外する", () => {
  const base = rider("base", 1, [lap(2, 120, 120), lap(3, 60, 180)]);
  const target = rider("target", 2, [lap(2, 125, 125), lap(3, 62, 187)]);
  const data = race([base, target]);

  assert.deepEqual(getValidTimedLaps(base).map((item) => item.lapNumber), [3]);
  assert.deepEqual(buildGapSeries(data, "base", ["target"]), [
    { lapNumber: 2, target: 5 },
    { lapNumber: 3, target: 7 },
  ]);
  assert.deepEqual(buildPaceDeltaSeries(data, "base", ["target"]), [
    { lapNumber: 2 },
    { lapNumber: 3, target: 2 },
  ]);
});

test("DNFは内部finalPositionを結果順位として返さない", () => {
  const leader = rider("leader", 1, [lap(1, 60, 60), lap(2, 60, 120)]);
  const dnf = rider("dnf", 9, [lap(1, 65, 65, 3)], "dnf");
  const result = getRiderResult(race([leader, dnf]), "dnf");

  assert.deepEqual(result, {
    kind: "dnf",
    completedLapNumber: 1,
    finalCheckpointRank: 3,
    gapToLeaderAtCheckpointSec: 5,
  });
  assert.equal(result && "position" in result, false);
});

test("周回遅れのfinished riderは時間差ではなくlapDeficitを返す", () => {
  const leader = rider("leader", 1, [
    lap(1, 60, 60),
    lap(2, 60, 120),
    lap(3, 60, 180),
  ]);
  const lapped = rider("lapped", 4, [lap(1, 70, 70), lap(2, 70, 140)]);

  assert.deepEqual(getRiderResult(race([leader, lapped]), "lapped"), {
    kind: "lapped",
    position: 4,
    lapDeficit: 1,
    completedLapNumber: 2,
  });
});

test("不正周回、重複、0秒、空配列、dataQuality errorを安全に扱う", () => {
  const malformed = rider("malformed", 2, [
    { ...lap(1, 0, 60), lapNumber: undefined } as unknown as LapRecord,
    lap(1, 0, 60),
    lap(2, 60, 120),
    lap(2, 61, 121),
    lap(3, 62, 183),
  ]);
  const empty = rider("empty", 3, []);
  const broken = rider("broken", 4, [lap(1, 60, 60)], "finished", "error");
  const data = race([malformed, empty, broken]);

  assert.deepEqual(getValidCheckpoints(malformed).map((item) => item.lapNumber), [1, 3]);
  assert.deepEqual(getValidTimedLaps(malformed), []);
  assert.deepEqual(getRaceLapNumbers(data), [1, 3]);
  assert.deepEqual(getRiderResult(data, "empty"), {
    kind: "unavailable",
    reason: "no-checkpoints",
  });
  assert.deepEqual(getRiderResult(data, "broken"), {
    kind: "unavailable",
    reason: "data-quality",
  });
});

test("有効チェックポイントがない選手は分析対象にできない", () => {
  const invalidOnly = rider("invalid-only", 2, [
    { ...lap(0, 60, 60), lapNumber: 0 },
    { ...lap(1, 60, 60), rankAtLap: Number.NaN },
    lap(2, 60, 120),
    lap(2, 61, 121),
  ]);

  assert.deepEqual(getValidCheckpoints(invalidOnly), []);
  assert.deepEqual(getRiderResult(race([invalidOnly]), "invalid-only"), {
    kind: "unavailable",
    reason: "no-checkpoints",
  });
});
