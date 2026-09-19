import assert from "node:assert/strict";
import test from "node:test";
import { getRaceStory } from "../lib/dataTransform";
import type { LapRecord, RaceResult, Rider } from "../lib/types";

function lap(lapNumber: number, lapTimeSec: number, rankAtLap: number): LapRecord {
  return {
    lapNumber,
    lapTimeSec,
    cumulativeTimeSec: lapNumber * lapTimeSec,
    rankAtLap,
  };
}

function rider(
  riderId: string,
  laps: LapRecord[],
  status: Rider["status"] = "finished",
): Rider {
  return {
    riderId,
    name: riderId,
    finalPosition: laps.at(-1)?.rankAtLap ?? 99,
    status,
    laps,
    dataQuality: "ok",
  };
}

function race(riders: Rider[]): RaceResult {
  return {
    raceId: "race-story",
    raceName: "Race story",
    category: "ME1",
    updatedAt: "2026-09-19T00:00:00Z",
    riders,
  };
}

test("race story reports a rank gain with relative pace improvement from reversal peers", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 5), lap(2, 100, 4), lap(3, 100, 3)]),
      rider("peer-a", [lap(1, 99, 4), lap(2, 104, 5), lap(3, 106, 5)]),
      rider("peer-b", [lap(1, 98, 3), lap(2, 103, 3), lap(3, 105, 5)]),
    ]),
    "selected",
  );

  assert.deepEqual(result, {
    highestRank: { lapNumber: 3, rank: 3 },
    maximumRankChange: { lapNumber: 2, positions: 1, direction: "gained" },
    narrative: "後半に相対的なペースを上げ、順位を2つ上げました。",
    available: true,
    paceTrend: "improved",
    netRankChange: 2,
  });
});

test("race story reports a rank loss with relative pace decline", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 3), lap(2, 100, 4), lap(3, 100, 5)]),
      rider("peer-a", [lap(1, 105, 4), lap(2, 98, 3), lap(3, 94, 2)]),
      rider("peer-b", [lap(1, 104, 5), lap(2, 97, 3), lap(3, 93, 2)]),
    ]),
    "selected",
  );

  assert.equal(result?.paceTrend, "declined");
  assert.equal(result?.netRankChange, -2);
  assert.equal(result?.narrative, "後半は周囲に対するペースが落ち、順位を2つ下げました。");
});

test("a short DNF interval is evaluated through its final valid checkpoint", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 4), lap(2, 100, 4), lap(3, 100, 4)], "dnf"),
      rider("peer-a", [lap(1, 100, 3), lap(2, 101, 3), lap(3, 100, 3)]),
      rider("peer-b", [lap(1, 100, 5), lap(2, 99, 5), lap(3, 100, 5)]),
    ]),
    "selected",
  );

  assert.equal(result?.available, true);
  assert.equal(result?.paceTrend, "maintained");
  assert.equal(result?.narrative, "後半も相対的にペースを維持し、順位を維持しました。");
});

test("annotated ranks remain opaque while their recorded interval is evaluated", () => {
  const selected = rider(
    "selected",
    [lap(1, 100, 4), lap(2, 100, 3), lap(3, 100, 2)],
    "annotated-rank",
  );
  selected.officialPositionLabel = "2 LapOut";
  const result = getRaceStory(
    race([
      selected,
      rider("peer-a", [lap(1, 99, 3), lap(2, 104, 4), lap(3, 106, 4)]),
      rider("peer-b", [lap(1, 98, 2), lap(2, 103, 3), lap(3, 105, 4)]),
    ]),
    "selected",
  );

  assert.equal(result?.available, true);
  assert.doesNotMatch(result?.narrative ?? "", /LapOut|足切り/);
});

test("missing shared pace evidence keeps rank facts but withholds the narrative", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 4), lap(2, 100, 3)]),
      rider("peer-a", [lap(1, 100, 3), lap(2, 0, 4)]),
      rider("peer-b", [lap(1, 101, 5), lap(2, 0, 4)]),
    ]),
    "selected",
  );

  assert.deepEqual(result, {
    highestRank: { lapNumber: 2, rank: 3 },
    maximumRankChange: { lapNumber: 2, positions: 1, direction: "gained" },
    narrative: "記録が限られるため、レース展開は評価できません。",
    available: false,
    paceTrend: null,
    netRankChange: 1,
  });
});

test("duplicate and invalid checkpoints do not bridge a maximum rank change", () => {
  const invalidCheckpoint = {
    ...lap(3, 100, 2),
    cumulativeTimeSec: Number.NaN,
  };
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 5),
        lap(2, 100, 4),
        lap(2, 100, 3),
        invalidCheckpoint,
        lap(4, 100, 1),
      ]),
    ]),
    "selected",
  );

  assert.deepEqual(result, {
    highestRank: { lapNumber: 4, rank: 1 },
    maximumRankChange: null,
    narrative: "記録が限られるため、レース展開は評価できません。",
    available: false,
    paceTrend: null,
    netRankChange: 4,
  });
});

test("unmatched timed laps cannot supply a relative pace narrative", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 4), lap(2, 100, 3), lap(3, 100, 2)]),
      rider("peer-a", [lap(1, 99, 3), lap(3, 103, 4)]),
      rider("peer-b", [lap(1, 98, 2), lap(3, 104, 4)]),
    ]),
    "selected",
  );

  assert.equal(result?.available, false);
  assert.equal(result?.narrative, "記録が限られるため、レース展開は評価できません。");
  assert.equal(result?.maximumRankChange?.lapNumber, 2);
});
