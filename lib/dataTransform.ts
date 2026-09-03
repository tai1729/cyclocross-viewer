import type { LapRecord, RaceResult, Rider } from "@/lib/types";

export function getRiderById(
  race: RaceResult,
  riderId: string,
): Rider | undefined {
  return race.riders.find((r) => r.riderId === riderId);
}

export function getRiderByPosition(
  race: RaceResult,
  position: number,
): Rider | undefined {
  return race.riders.find((r) => r.finalPosition === position);
}

function hasValidCheckpointShape(lap: LapRecord): boolean {
  return (
    Number.isInteger(lap.lapNumber) &&
    lap.lapNumber > 0 &&
    Number.isFinite(lap.cumulativeTimeSec) &&
    Number.isFinite(lap.rankAtLap)
  );
}

/** 周回番号を一意に確定できる、有効なチェックポイントだけを返す。 */
export function getValidCheckpoints(rider: Rider): LapRecord[] {
  const candidateLaps = rider.laps.filter(hasValidCheckpointShape);
  const counts = new Map<number, number>();

  for (const lap of candidateLaps) {
    counts.set(lap.lapNumber, (counts.get(lap.lapNumber) ?? 0) + 1);
  }

  return candidateLaps
    .filter((lap) => counts.get(lap.lapNumber) === 1)
    .sort((a, b) => a.lapNumber - b.lapNumber);
}

/** 単周タイムとして意味を持つ、有効な周回だけを返す。 */
export function getValidTimedLaps(rider: Rider): LapRecord[] {
  const checkpoints = getValidCheckpoints(rider);
  const checkpointNumbers = new Set(checkpoints.map((lap) => lap.lapNumber));

  return checkpoints.filter(
    (lap) =>
      Number.isFinite(lap.lapTimeSec) &&
      lap.lapTimeSec > 0 &&
      (lap.lapNumber === 1 || checkpointNumbers.has(lap.lapNumber - 1)),
  );
}

export function buildLapMap(
  rider: Rider,
  timedOnly = false,
): Map<number, LapRecord> {
  const laps = timedOnly ? getValidTimedLaps(rider) : getValidCheckpoints(rider);
  return new Map(laps.map((lap) => [lap.lapNumber, lap]));
}

function getLastCheckpoint(rider: Rider): LapRecord | undefined {
  return getValidCheckpoints(rider).at(-1);
}

/** そのライダーの最終有効チェックポイント時点の累積タイム（秒）。 */
export function getTotalTimeSec(rider: Rider): number {
  return getLastCheckpoint(rider)?.cumulativeTimeSec ?? 0;
}

/**
 * riderの最終周回とreferenceの同じ周回番号の累積タイムを比較してギャップを出す。
 * riderが周回遅れ（referenceより完走周回数が少ない）の場合、単純な合計タイム差だと
 * 「完走できなかった分」だけマイナスの値になってしまうため、riderが最後に記録した
 * 周回と同じ周回番号の時点でreferenceと比較する。
 */
export function getGapAtRiderFinish(
  rider: Rider,
  reference: Rider,
): number | null {
  const riderLastLap = getLastCheckpoint(rider);
  if (!riderLastLap) return null;

  const referenceLapAtSamePoint = buildLapMap(reference).get(
    riderLastLap.lapNumber,
  );
  if (!referenceLapAtSamePoint) return null;

  return riderLastLap.cumulativeTimeSec - referenceLapAtSamePoint.cumulativeTimeSec;
}

/**
 * 秒数を "+1'23"" のような表記に変換する。
 * gapSecが0の場合は "±0"" を返す。
 */
export function formatGapSec(gapSec: number): string {
  const sign = gapSec > 0 ? "+" : gapSec < 0 ? "-" : "±";
  const abs = Math.abs(Math.round(gapSec));
  const min = Math.floor(abs / 60);
  const sec = abs % 60;
  if (min === 0) {
    return `${sign}${sec}"`;
  }
  return `${sign}${min}'${String(sec).padStart(2, "0")}"`;
}

/** 秒数を "7:32" のような mm:ss 表記に変換する（ラップタイム表示用）。 */
export function formatSecToClock(sec: number): string {
  const abs = Math.max(0, Math.round(sec));
  const min = Math.floor(abs / 60);
  const s = abs % 60;
  return `${min}:${String(s).padStart(2, "0")}`;
}

export type RiderResult =
  | {
      kind: "finished";
      position: number;
      totalTimeSec: number;
      gapToLeaderSec: number;
      completedLapNumber: number;
    }
  | {
      kind: "lapped";
      position: number;
      lapDeficit: number;
      completedLapNumber: number;
    }
  | {
      kind: "dnf";
      completedLapNumber: number | null;
      finalCheckpointRank: number | null;
      gapToLeaderAtCheckpointSec: number | null;
    }
  | {
      kind: "unavailable";
      reason: "data-quality" | "no-checkpoints" | "no-leader";
    };

export function getRiderResult(
  race: RaceResult,
  riderId: string,
): RiderResult | null {
  const rider = getRiderById(race, riderId);
  if (!rider) return null;

  if (rider.dataQuality === "error") {
    return { kind: "unavailable", reason: "data-quality" };
  }

  const riderLastLap = getLastCheckpoint(rider);
  const leader = getRiderByPosition(race, 1);
  const leaderLastLap = leader ? getLastCheckpoint(leader) : undefined;

  if (rider.status === "dnf") {
    return {
      kind: "dnf",
      completedLapNumber: riderLastLap?.lapNumber ?? null,
      finalCheckpointRank: riderLastLap?.rankAtLap ?? null,
      gapToLeaderAtCheckpointSec:
        riderLastLap && leader ? getGapAtRiderFinish(rider, leader) : null,
    };
  }

  if (!riderLastLap) {
    return { kind: "unavailable", reason: "no-checkpoints" };
  }
  if (!leader || !leaderLastLap) {
    return { kind: "unavailable", reason: "no-leader" };
  }

  if (riderLastLap.lapNumber < leaderLastLap.lapNumber) {
    return {
      kind: "lapped",
      position: rider.finalPosition,
      lapDeficit: leaderLastLap.lapNumber - riderLastLap.lapNumber,
      completedLapNumber: riderLastLap.lapNumber,
    };
  }

  const gapToLeaderSec = getGapAtRiderFinish(rider, leader);
  if (gapToLeaderSec === null) {
    return { kind: "unavailable", reason: "no-leader" };
  }

  return {
    kind: "finished",
    position: rider.finalPosition,
    totalTimeSec: riderLastLap.cumulativeTimeSec,
    gapToLeaderSec,
    completedLapNumber: riderLastLap.lapNumber,
  };
}

export interface RiderSummary {
  result: RiderResult;
  totalRiders: number;
  promotionZoneRank: number | null;
  promotionGapSec: number | null;
  isInPromotionZone: boolean;
}

export function getRiderSummary(
  race: RaceResult,
  riderId: string,
): RiderSummary | null {
  const rider = getRiderById(race, riderId);
  if (!rider) return null;
  const result = getRiderResult(race, riderId);
  if (!result) return null;

  const promotionRider =
    race.promotionZoneRank !== undefined
      ? getRiderByPosition(race, race.promotionZoneRank)
      : undefined;

  const promotionGapSec = promotionRider
    ? getGapAtRiderFinish(rider, promotionRider)
    : null;
  const hasOfficialPosition =
    result.kind === "finished" || result.kind === "lapped";

  return {
    result,
    totalRiders: race.riders.length,
    promotionZoneRank: race.promotionZoneRank ?? null,
    promotionGapSec,
    isInPromotionZone:
      hasOfficialPosition &&
      race.promotionZoneRank !== undefined &&
      rider.finalPosition <= race.promotionZoneRank,
  };
}

/** レース内の有効チェックポイントにある周回番号を和集合で返す。 */
export function getRaceLapNumbers(race: RaceResult): number[] {
  const lapNumbers = new Set<number>();
  for (const rider of race.riders) {
    for (const lap of getValidCheckpoints(rider)) {
      lapNumbers.add(lap.lapNumber);
    }
  }
  return [...lapNumbers].sort((a, b) => a - b);
}

/** 基準選手(baseRiderId)を±0とした、各対象選手の周回ごとのギャップ推移。 */
export interface GapSeriesPoint {
  lapNumber: number;
  [riderId: string]: number;
}

export function buildGapSeries(
  race: RaceResult,
  baseRiderId: string,
  targetRiderIds: string[],
): GapSeriesPoint[] {
  const baseRider = getRiderById(race, baseRiderId);
  if (!baseRider) return [];

  const baseMap = buildLapMap(baseRider);
  const targetMaps = new Map(
    targetRiderIds.map((riderId) => {
      const rider = getRiderById(race, riderId);
      return [riderId, rider ? buildLapMap(rider) : new Map<number, LapRecord>()];
    }),
  );
  const points: GapSeriesPoint[] = [];

  for (const lapNumber of getRaceLapNumbers(race)) {
    const point: GapSeriesPoint = { lapNumber };
    const baseLap = baseMap.get(lapNumber);
    if (!baseLap) {
      points.push(point);
      continue;
    }

    for (const riderId of targetRiderIds) {
      const lap = targetMaps.get(riderId)?.get(lapNumber);
      if (lap) {
        point[riderId] = lap.cumulativeTimeSec - baseLap.cumulativeTimeSec;
      }
    }
    points.push(point);
  }

  return points;
}

/**
 * 基準選手(baseRiderId)に対する、各対象選手の周回ごとの「その周だけのペース差」。
 * プラス＝その周は相手の方がラップタイムが長かった（差が縮む方向）、
 * マイナス＝相手の方が速かった（差が広がる方向）。
 */
export function buildPaceDeltaSeries(
  race: RaceResult,
  baseRiderId: string,
  targetRiderIds: string[],
): GapSeriesPoint[] {
  const baseRider = getRiderById(race, baseRiderId);
  if (!baseRider) return [];

  const baseMap = buildLapMap(baseRider, true);
  const targetMaps = new Map(
    targetRiderIds.map((riderId) => {
      const rider = getRiderById(race, riderId);
      return [riderId, rider ? buildLapMap(rider, true) : new Map<number, LapRecord>()];
    }),
  );
  const points: GapSeriesPoint[] = [];

  for (const lapNumber of getRaceLapNumbers(race)) {
    const point: GapSeriesPoint = { lapNumber };
    const baseLap = baseMap.get(lapNumber);
    if (!baseLap) {
      points.push(point);
      continue;
    }

    for (const riderId of targetRiderIds) {
      const lap = targetMaps.get(riderId)?.get(lapNumber);
      if (lap) {
        point[riderId] = lap.lapTimeSec - baseLap.lapTimeSec;
      }
    }
    points.push(point);
  }

  return points;
}
