import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLapDeltaRows,
  buildGapSeries,
  buildPaceDeltaSeries,
  getLapStatistics,
  getMaximumLapLoss,
  getRaceLapNumbers,
  getRiderResult,
  getMeasuredLapRows,
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

test("measured rows and lap statistics use raw timed values and earliest ties", () => {
  const selected = rider("selected", 1, [
    lap(1, 61.4, 61.4, 4),
    lap(2, 60.2, 121.6, 3),
    lap(3, 60.2, 181.8, 2),
    lap(4, 62.8, 244.6, 1),
  ]);

  assert.deepEqual(getMeasuredLapRows(selected), [
    { lapNumber: 1, lapTimeSec: 61.4, cumulativeTimeSec: 61.4, rankAtLap: 4 },
    { lapNumber: 2, lapTimeSec: 60.2, cumulativeTimeSec: 121.6, rankAtLap: 3 },
    { lapNumber: 3, lapTimeSec: 60.2, cumulativeTimeSec: 181.8, rankAtLap: 2 },
    { lapNumber: 4, lapTimeSec: 62.8, cumulativeTimeSec: 244.6, rankAtLap: 1 },
  ]);
  assert.deepEqual(getLapStatistics(selected), {
    fastestLap: {
      lapNumber: 2,
      lapTimeSec: 60.2,
      cumulativeTimeSec: 121.6,
      rankAtLap: 3,
    },
    averageLapTimeSec: (61.4 + 60.2 + 60.2 + 62.8) / 4,
  });
});

test("lap statistics explicitly report no valid timed laps", () => {
  const noTimedLaps = rider("no-timed-laps", 1, [lap(1, 0, 60), lap(2, 0, 120)]);

  assert.deepEqual(getMeasuredLapRows(noTimedLaps), []);
  assert.deepEqual(getLapStatistics(noTimedLaps), {
    fastestLap: null,
    averageLapTimeSec: null,
  });
});

test("lap deltas are sparse and preserve primary rows around missing fixed data", () => {
  const primary = rider("primary", 1, [
    lap(1, 60, 60),
    lap(2, 61, 121),
    lap(3, 62, 183),
  ]);
  const fixed = rider("fixed", 2, [lap(1, 63, 63)]);

  assert.deepEqual(buildLapDeltaRows(primary, [fixed]), [
    { lapNumber: 1, deltas: { fixed: 3 } },
    { lapNumber: 2, deltas: {} },
    { lapNumber: 3, deltas: {} },
  ]);
});

test("duplicate fixed laps invalidate only that rider's delta and loss candidates", () => {
  const primary = rider("primary", 1, [lap(1, 70, 70), lap(2, 70, 140)]);
  const duplicate = rider("duplicate", 2, [
    lap(1, 75, 75),
    lap(2, 60, 120),
    lap(2, 61, 121),
  ]);
  const valid = rider("valid", 3, [lap(1, 65, 65), lap(2, 65, 130)]);

  assert.deepEqual(buildLapDeltaRows(primary, [duplicate, valid]), [
    { lapNumber: 1, deltas: { duplicate: 5, valid: -5 } },
    { lapNumber: 2, deltas: { valid: -5 } },
  ]);
  assert.deepEqual(getMaximumLapLoss(primary, [duplicate, valid]), {
    fixedRiderId: "valid",
    lapNumber: 1,
    lossSec: 5,
  });
});

test("maximum loss uses positive raw values, earliest lap, then fixed-rider order", () => {
  const primary = rider("primary", 1, [
    lap(1, 70.4, 70.4),
    lap(2, 80.4, 150.8),
  ]);
  const firstFixed = rider("first", 2, [lap(1, 70.4, 70.4), lap(2, 75.4, 145.8)]);
  const secondFixed = rider("second", 3, [lap(1, 65.4, 65.4), lap(2, 80.4, 145.8)]);
  const thirdFixed = rider("third", 4, [lap(1, 65.4, 65.4)]);

  assert.deepEqual(getMaximumLapLoss(primary, [thirdFixed, secondFixed, firstFixed]), {
    fixedRiderId: "third",
    lapNumber: 1,
    lossSec: 5,
  });
  assert.equal(
    getMaximumLapLoss(
      rider("primary", 1, [lap(1, 60, 60)]),
      [rider("faster", 2, [lap(1, 61, 61)])],
    ),
    null,
  );
});

test("measured transforms retain valid DNF and lapped rows but omit invalid tails", () => {
  const dnf = rider(
    "dnf",
    4,
    [lap(1, 65, 65), lap(2, 0, 65), { ...lap(3, 64, 129), rankAtLap: Number.NaN }],
    "dnf",
  );
  const lapped = rider("lapped", 3, [lap(1, 70, 70), lap(2, 71, 141)]);

  assert.deepEqual(getMeasuredLapRows(dnf), [
    { lapNumber: 1, lapTimeSec: 65, cumulativeTimeSec: 65, rankAtLap: 1 },
  ]);
  assert.deepEqual(getMeasuredLapRows(lapped).map((row) => row.lapNumber), [1, 2]);
  assert.equal(getMaximumLapLoss(dnf, [lapped]), null);
});

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

test("difference series preserve sign direction and the union lap axis", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(2, 70, 130),
    lap(3, 60, 190),
    lap(4, 60, 250),
  ]);
  const target = rider("target", 2, [
    lap(1, 55, 55),
    lap(3, 65, 120),
    lap(4, 65, 185),
  ]);

  assert.deepEqual(buildGapSeries(race([base, target]), "base", ["target"]), [
    { lapNumber: 1, target: -5 },
    { lapNumber: 2 },
    { lapNumber: 3, target: -70 },
    { lapNumber: 4, target: -65 },
  ]);
  assert.deepEqual(
    buildPaceDeltaSeries(race([base, target]), "base", ["target"]),
    [
      { lapNumber: 1, target: -5 },
      { lapNumber: 2 },
      { lapNumber: 3 },
      { lapNumber: 4, target: 5 },
    ],
  );
});

test("a missing primary checkpoint suppresses all difference values at that lap", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(3, 60, 120),
    lap(4, 60, 180),
  ]);
  const target = rider("target", 2, [
    lap(1, 65, 65),
    lap(2, 65, 130),
    lap(3, 65, 195),
    lap(4, 65, 260),
  ]);

  assert.deepEqual(buildGapSeries(race([base, target]), "base", ["target"]), [
    { lapNumber: 1, target: 5 },
    { lapNumber: 2 },
    { lapNumber: 3, target: 75 },
    { lapNumber: 4, target: 80 },
  ]);
  assert.deepEqual(
    buildPaceDeltaSeries(race([base, target]), "base", ["target"]),
    [
      { lapNumber: 1, target: 5 },
      { lapNumber: 2 },
      { lapNumber: 3 },
      { lapNumber: 4, target: 5 },
    ],
  );
});

test("duplicate checkpoints invalidate only that rider and lap", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(2, 60, 120),
    lap(3, 60, 180),
  ]);
  const duplicate = rider("duplicate", 2, [
    lap(1, 65, 65),
    lap(2, 65, 130),
    lap(2, 66, 131),
    lap(3, 65, 196),
  ]);
  const peer = rider("peer", 3, [lap(2, 62, 122)]);

  assert.deepEqual(
    buildGapSeries(race([base, duplicate, peer]), "base", ["duplicate", "peer"]),
    [
      { lapNumber: 1, duplicate: 5 },
      { lapNumber: 2, peer: 2 },
      { lapNumber: 3, duplicate: 16 },
    ],
  );
  assert.deepEqual(
    buildPaceDeltaSeries(race([base, duplicate, peer]), "base", [
      "duplicate",
      "peer",
    ]),
    [
      { lapNumber: 1, duplicate: 5 },
      { lapNumber: 2 },
      { lapNumber: 3 },
    ],
  );
});

test("DNF and lapped riders contribute measured values only", () => {
  const base = rider("base", 1, [
    lap(1, 60, 60),
    lap(2, 60, 120),
    lap(3, 60, 180),
  ]);
  const dnf = rider("dnf", 4, [lap(1, 65, 65)], "dnf");
  const lapped = rider("lapped", 3, [
    lap(1, 70, 70),
    lap(2, 70, 140),
  ]);

  assert.deepEqual(
    buildGapSeries(race([base, dnf, lapped]), "base", ["dnf", "lapped"]),
    [
      { lapNumber: 1, dnf: 5, lapped: 10 },
      { lapNumber: 2, lapped: 20 },
      { lapNumber: 3 },
    ],
  );
  assert.deepEqual(
    buildPaceDeltaSeries(race([base, dnf, lapped]), "base", ["dnf", "lapped"]),
    [
      { lapNumber: 1, dnf: 5, lapped: 10 },
      { lapNumber: 2, lapped: 10 },
      { lapNumber: 3 },
    ],
  );
});
