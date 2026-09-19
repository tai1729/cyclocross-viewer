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
    narrative: "周囲との相対ペースを上げ、順位を2つ上げました。",
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
  assert.equal(result?.narrative, "周囲との相対ペースを下げ、順位を2つ下げました。");
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
  assert.equal(result?.narrative, "周囲との相対ペースをおおむね維持し、順位を維持しました。");
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

test("a rider who settles into the lead is described by the settled rank, not a distant late sprint", () => {
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 4),
        lap(2, 100, 7),
        lap(3, 100, 7),
        lap(4, 100, 3),
        lap(5, 100, 2),
        lap(6, 100, 1),
        lap(7, 100, 1),
        lap(8, 100, 1),
      ]),
      rider("peer-a", [
        lap(1, 101, 3),
        lap(2, 101, 4),
        lap(3, 101, 4),
        lap(4, 101, 4),
        lap(5, 101, 3),
        lap(6, 101, 2),
        lap(7, 80, 2),
        lap(8, 80, 2),
      ]),
      rider("peer-b", [
        lap(1, 102, 2),
        lap(2, 102, 3),
        lap(3, 102, 3),
        lap(4, 102, 2),
        lap(5, 102, 4),
        lap(6, 102, 3),
        lap(7, 79, 3),
        lap(8, 79, 3),
      ]),
    ]),
    "selected",
  );

  assert.equal(result?.available, true);
  assert.equal(result?.paceTrend, null);
  assert.equal(result?.narrative, "6周目に首位へ上がり、そのまま首位を守り切りました。");
});

test("a distant late sprint cannot change a non-leader's settled rank-interval pace verdict", () => {
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 5),
        lap(2, 100, 4),
        lap(3, 100, 3),
        lap(4, 100, 3),
        lap(5, 100, 3),
      ]),
      rider("peer-a", [
        lap(1, 98, 4),
        lap(2, 104, 5),
        lap(3, 105, 5),
        lap(4, 70, 5),
        lap(5, 70, 5),
      ]),
      rider("peer-b", [
        lap(1, 97, 3),
        lap(2, 103, 3),
        lap(3, 104, 5),
        lap(4, 70, 5),
        lap(5, 70, 5),
      ]),
    ]),
    "selected",
  );

  assert.equal(result?.available, true);
  assert.equal(result?.paceTrend, "improved");
  assert.equal(result?.narrative, "周囲との相対ペースを上げ、順位を2つ上げました。");
});

test("a contradictory pace and rank direction separates facts without claiming a cause", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 2), lap(2, 100, 3), lap(3, 100, 3)]),
      rider("peer-a", [lap(1, 99, 3), lap(2, 104, 2), lap(3, 105, 2)]),
      rider("peer-b", [lap(1, 98, 4), lap(2, 103, 2), lap(3, 104, 2)]),
    ]),
    "selected",
  );

  assert.equal(result?.paceTrend, "improved");
  assert.equal(result?.netRankChange, -1);
  assert.equal(
    result?.narrative,
    "順位を1つ下げました。周囲との相対ペースを上げました。順位変化の理由は記録だけでは特定できません。",
  );
});

test("a changed relative pace with stable rank does not invent a rank-change reason", () => {
  const result = getRaceStory(
    race([
      rider("selected", [lap(1, 100, 3), lap(2, 100, 3), lap(3, 100, 3)]),
      rider("peer-a", [lap(1, 99, 4), lap(2, 104, 4), lap(3, 105, 4)]),
      rider("peer-b", [lap(1, 98, 5), lap(2, 103, 4), lap(3, 104, 4)]),
    ]),
    "selected",
  );

  assert.equal(result?.paceTrend, "improved");
  assert.equal(result?.netRankChange, 0);
  assert.equal(result?.narrative, "順位を維持しました。周囲との相対ペースを上げました。");
});

test("six or more valid checkpoints report separate first and latter race phases", () => {
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 5),
        lap(2, 100, 4),
        lap(3, 100, 3),
        lap(4, 100, 3),
        lap(5, 100, 2),
        lap(6, 100, 2),
      ]),
      rider("peer-a", [
        lap(1, 99, 4),
        lap(2, 104, 5),
        lap(3, 105, 5),
        lap(4, 104, 4),
        lap(5, 105, 3),
        lap(6, 106, 3),
      ]),
      rider("peer-b", [
        lap(1, 98, 3),
        lap(2, 103, 3),
        lap(3, 104, 5),
        lap(4, 103, 5),
        lap(5, 104, 4),
        lap(6, 105, 4),
      ]),
    ]),
    "selected",
  );

  assert.deepEqual(result?.phaseNarratives, [
    "前半: 5位→3位、相対ペースを上げました。",
    "後半: 3位→2位、相対ペースはおおむね維持でした。",
  ]);
});

test("phase rank ranges remain visible when shared pace evidence is unavailable", () => {
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 5),
        lap(2, 100, 4),
        lap(3, 100, 3),
        lap(4, 100, 3),
        lap(5, 100, 2),
        lap(6, 100, 2),
      ]),
      rider("peer-a", [
        lap(1, 0, 4),
        lap(2, 0, 5),
        lap(3, 0, 5),
        lap(4, 0, 4),
        lap(5, 0, 3),
        lap(6, 0, 3),
      ]),
      rider("peer-b", [
        lap(1, 0, 3),
        lap(2, 0, 3),
        lap(3, 0, 5),
        lap(4, 0, 5),
        lap(5, 0, 4),
        lap(6, 0, 4),
      ]),
    ]),
    "selected",
  );

  assert.equal(result?.available, false);
  assert.deepEqual(result?.phaseNarratives, [
    "前半: 5位→3位、ペースは評価できません。",
    "後半: 3位→2位、ペースは評価できません。",
  ]);
});

test("five valid checkpoints retain the whole-race narrative without phase rows", () => {
  const result = getRaceStory(
    race([
      rider("selected", [
        lap(1, 100, 5),
        lap(2, 100, 4),
        lap(3, 100, 3),
        lap(4, 100, 2),
        lap(5, 100, 1),
      ]),
      rider("peer-a", [
        lap(1, 99, 4),
        lap(2, 104, 5),
        lap(3, 105, 5),
        lap(4, 106, 5),
        lap(5, 107, 5),
      ]),
      rider("peer-b", [
        lap(1, 98, 3),
        lap(2, 103, 3),
        lap(3, 104, 5),
        lap(4, 105, 5),
        lap(5, 106, 5),
      ]),
    ]),
    "selected",
  );

  assert.equal(result?.phaseNarratives, undefined);
});

test("rank-near peers with a large cumulative gap cannot supply a pace verdict", () => {
  const selectedLaps = [lap(1, 100, 4), lap(2, 100, 3)];
  const farPeerA = [lap(1, 90, 3), lap(2, 70, 4)].map((record) => ({
    ...record,
    cumulativeTimeSec: record.cumulativeTimeSec + 300,
  }));
  const farPeerB = [lap(1, 91, 5), lap(2, 71, 4)].map((record) => ({
    ...record,
    cumulativeTimeSec: record.cumulativeTimeSec + 300,
  }));
  const result = getRaceStory(
    race([
      rider("selected", selectedLaps),
      rider("peer-a", farPeerA),
      rider("peer-b", farPeerB),
    ]),
    "selected",
  );

  assert.equal(result?.available, false);
  assert.equal(result?.paceTrend, null);
  assert.equal(result?.narrative, "記録が限られるため、レース展開は評価できません。");
});
