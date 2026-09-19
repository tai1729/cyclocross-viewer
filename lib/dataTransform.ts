import {
  isValidRaceLapNumbers,
  type LapRecord,
  type RaceResult,
  type Rider,
} from "@/lib/types";

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

export interface MeasuredLapRow {
  lapNumber: number;
  lapTimeSec: number;
  cumulativeTimeSec: number;
  rankAtLap: number;
}

export interface LapStatistics {
  fastestLap: MeasuredLapRow | null;
  averageLapTimeSec: number | null;
}

export function getMeasuredLapRows(rider: Rider): MeasuredLapRow[] {
  return getValidTimedLaps(rider).map(
    ({ lapNumber, lapTimeSec, cumulativeTimeSec, rankAtLap }) => ({
      lapNumber,
      lapTimeSec,
      cumulativeTimeSec,
      rankAtLap,
    }),
  );
}

export function getLapStatistics(rider: Rider): LapStatistics {
  const laps = getMeasuredLapRows(rider);
  if (laps.length === 0) {
    return { fastestLap: null, averageLapTimeSec: null };
  }

  const fastestLap = laps.reduce((fastest, current) => {
    if (
      current.lapTimeSec < fastest.lapTimeSec ||
      (current.lapTimeSec === fastest.lapTimeSec &&
        current.lapNumber < fastest.lapNumber)
    ) {
      return current;
    }
    return fastest;
  });
  const averageLapTimeSec =
    laps.reduce((total, current) => total + current.lapTimeSec, 0) / laps.length;

  return { fastestLap, averageLapTimeSec };
}

export type RaceStoryPaceTrend = "improved" | "maintained" | "declined";

export interface RaceStoryRankChange {
  lapNumber: number;
  positions: number;
  direction: "gained" | "lost";
}

export interface RaceStory {
  highestRank: { lapNumber: number; rank: number } | null;
  maximumRankChange: RaceStoryRankChange | null;
  narrative: string;
  available: boolean;
  paceTrend: RaceStoryPaceTrend | null;
  netRankChange: number | null;
}

const RACE_STORY_UNAVAILABLE =
  "記録が限られるため、レース展開は評価できません。";

/**
 * Build a conservative race-level story from observed ranks and same-lap
 * timing. It is intentionally not an incident or cause detector.
 */
export function getRaceStory(race: RaceResult, riderId: string): RaceStory | null {
  const selectedRider = getRiderById(race, riderId);
  if (!selectedRider) return null;

  const selectedCheckpoints = getValidCheckpoints(selectedRider);
  const highestRank = getHighestObservedRank(selectedCheckpoints);
  const maximumRankChange = getMaximumObservedRankChange(selectedCheckpoints);
  const firstCheckpoint = selectedCheckpoints.at(0);
  const lastCheckpoint = selectedCheckpoints.at(-1);
  const netRankChange =
    firstCheckpoint && lastCheckpoint && firstCheckpoint !== lastCheckpoint
      ? firstCheckpoint.rankAtLap - lastCheckpoint.rankAtLap
      : null;

  const unavailable = (): RaceStory => ({
    highestRank,
    maximumRankChange,
    narrative: RACE_STORY_UNAVAILABLE,
    available: false,
    paceTrend: null,
    netRankChange,
  });

  if (!firstCheckpoint || !lastCheckpoint || netRankChange === null) {
    return unavailable();
  }

  const selectedTimedLaps = getValidTimedLaps(selectedRider);
  if (selectedTimedLaps.length === 0) return unavailable();

  const cohort = getRaceStoryCohort(race, selectedRider);
  const changes = cohort.flatMap((peer) => {
    const sharedTimedLaps = getSharedTimedLaps(selectedTimedLaps, getValidTimedLaps(peer));
    if (sharedTimedLaps.length < 2) return [];

    const early = sharedTimedLaps[0];
    const late = sharedTimedLaps.at(-1);
    if (!late) return [];
    return [
      (late.peer.lapTimeSec - late.selected.lapTimeSec) -
        (early.peer.lapTimeSec - early.selected.lapTimeSec),
    ];
  });

  if (changes.length < 2) return unavailable();

  const meanSelectedLap =
    selectedTimedLaps.reduce((total, lap) => total + lap.lapTimeSec, 0) /
    selectedTimedLaps.length;
  const tolerance = Math.max(3, meanSelectedLap * 0.02);
  const relativePaceChange = getMedian(changes);
  const paceTrend: RaceStoryPaceTrend =
    relativePaceChange > tolerance
      ? "improved"
      : relativePaceChange < -tolerance
        ? "declined"
        : "maintained";

  return {
    highestRank,
    maximumRankChange,
    narrative: getRaceStoryNarrative(paceTrend, netRankChange),
    available: true,
    paceTrend,
    netRankChange,
  };
}

function getHighestObservedRank(
  checkpoints: readonly LapRecord[],
): { lapNumber: number; rank: number } | null {
  const highest = checkpoints.reduce<LapRecord | null>((best, checkpoint) => {
    if (
      best === null ||
      checkpoint.rankAtLap < best.rankAtLap ||
      (checkpoint.rankAtLap === best.rankAtLap && checkpoint.lapNumber < best.lapNumber)
    ) {
      return checkpoint;
    }
    return best;
  }, null);
  return highest ? { lapNumber: highest.lapNumber, rank: highest.rankAtLap } : null;
}

function getMaximumObservedRankChange(
  checkpoints: readonly LapRecord[],
): RaceStoryRankChange | null {
  let maximum: RaceStoryRankChange | null = null;

  for (let index = 1; index < checkpoints.length; index++) {
    const previous = checkpoints[index - 1];
    const current = checkpoints[index];
    if (!previous || !current || current.lapNumber !== previous.lapNumber + 1) continue;

    const change = previous.rankAtLap - current.rankAtLap;
    const positions = Math.abs(change);
    if (positions === 0) continue;
    if (maximum === null || positions > maximum.positions) {
      maximum = {
        lapNumber: current.lapNumber,
        positions,
        direction: change > 0 ? "gained" : "lost",
      };
    }
  }

  return maximum;
}

function getRaceStoryCohort(race: RaceResult, selectedRider: Rider): Rider[] {
  const selectedCheckpoints = getValidCheckpoints(selectedRider);
  const selectedMap = new Map(selectedCheckpoints.map((lap) => [lap.lapNumber, lap]));
  const graphablePeers = race.riders.filter(
    (rider) =>
      rider.riderId !== selectedRider.riderId &&
      rider.dataQuality === "ok" &&
      getValidCheckpoints(rider).length > 0,
  );
  const reversalPeers = graphablePeers.filter((peer) =>
    hasRankReversal(selectedMap, getValidCheckpoints(peer)),
  );

  if (reversalPeers.length >= 2) return reversalPeers;

  const selectedIds = new Set(reversalPeers.map((peer) => peer.riderId));
  for (const peer of graphablePeers) {
    if (selectedIds.has(peer.riderId)) continue;
    if (isWithinFiveRanks(selectedMap, getValidCheckpoints(peer))) {
      selectedIds.add(peer.riderId);
    }
  }
  return graphablePeers.filter((peer) => selectedIds.has(peer.riderId));
}

function hasRankReversal(
  selectedMap: ReadonlyMap<number, LapRecord>,
  peerCheckpoints: readonly LapRecord[],
): boolean {
  let firstRelation: number | null = null;
  for (const peer of peerCheckpoints) {
    const selected = selectedMap.get(peer.lapNumber);
    if (!selected) continue;
    const relation = Math.sign(peer.rankAtLap - selected.rankAtLap);
    if (relation === 0) continue;
    if (firstRelation !== null && relation !== firstRelation) return true;
    firstRelation = relation;
  }
  return false;
}

function isWithinFiveRanks(
  selectedMap: ReadonlyMap<number, LapRecord>,
  peerCheckpoints: readonly LapRecord[],
): boolean {
  return peerCheckpoints.some((peer) => {
    const selected = selectedMap.get(peer.lapNumber);
    return selected !== undefined && Math.abs(peer.rankAtLap - selected.rankAtLap) <= 5;
  });
}

function getSharedTimedLaps(
  selectedLaps: readonly LapRecord[],
  peerLaps: readonly LapRecord[],
): { selected: LapRecord; peer: LapRecord }[] {
  const peerMap = new Map(peerLaps.map((lap) => [lap.lapNumber, lap]));
  return selectedLaps.flatMap((selected) => {
    const peer = peerMap.get(selected.lapNumber);
    return peer ? [{ selected, peer }] : [];
  });
}

function getMedian(values: readonly number[]): number {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  if (ordered.length % 2 === 1) return ordered[middle] ?? 0;
  return ((ordered[middle - 1] ?? 0) + (ordered[middle] ?? 0)) / 2;
}

function getRaceStoryNarrative(
  paceTrend: RaceStoryPaceTrend,
  netRankChange: number,
): string {
  const rankPhrase =
    netRankChange > 0
      ? `順位を${netRankChange}つ上げました。`
      : netRankChange < 0
        ? `順位を${Math.abs(netRankChange)}つ下げました。`
        : "順位を維持しました。";
  const pacePhrase =
    paceTrend === "improved"
      ? "後半に相対的なペースを上げ、"
      : paceTrend === "declined"
        ? "後半は周囲に対するペースが落ち、"
        : "後半も相対的にペースを維持し、";
  return `${pacePhrase}${rankPhrase}`;
}

export interface LapDeltaRow {
  lapNumber: number;
  deltas: Record<string, number | undefined>;
}

export function buildLapDeltaRows(
  primaryRider: Rider,
  fixedRiders: Rider[],
): LapDeltaRow[] {
  const primaryLaps = getValidTimedLaps(primaryRider);
  const fixedLapMaps = fixedRiders.map(
    (rider) => [rider.riderId, buildLapMap(rider, true)] as const,
  );

  return primaryLaps.map((primaryLap) => {
    const deltas: Record<string, number | undefined> = {};
    for (const [riderId, fixedLapMap] of fixedLapMaps) {
      const fixedLap = fixedLapMap.get(primaryLap.lapNumber);
      if (fixedLap) {
        deltas[riderId] = fixedLap.lapTimeSec - primaryLap.lapTimeSec;
      }
    }
    return { lapNumber: primaryLap.lapNumber, deltas };
  });
}

export interface MaximumLapLoss {
  fixedRiderId: string;
  lapNumber: number;
  lossSec: number;
}

export function getMaximumLapLoss(
  primaryRider: Rider,
  fixedRiders: Rider[],
): MaximumLapLoss | null {
  const primaryLaps = getValidTimedLaps(primaryRider);
  let maximumLoss: (MaximumLapLoss & { fixedRiderOrder: number }) | null = null;

  for (let fixedRiderOrder = 0; fixedRiderOrder < fixedRiders.length; fixedRiderOrder++) {
    const fixedRider = fixedRiders[fixedRiderOrder];
    const fixedLapMap = buildLapMap(fixedRider, true);
    for (const primaryLap of primaryLaps) {
      const fixedLap = fixedLapMap.get(primaryLap.lapNumber);
      if (!fixedLap) continue;

      const lossSec = primaryLap.lapTimeSec - fixedLap.lapTimeSec;
      if (lossSec <= 0) continue;

      if (
        maximumLoss === null ||
        lossSec > maximumLoss.lossSec ||
        (lossSec === maximumLoss.lossSec &&
          (primaryLap.lapNumber < maximumLoss.lapNumber ||
            (primaryLap.lapNumber === maximumLoss.lapNumber &&
              fixedRiderOrder < maximumLoss.fixedRiderOrder)))
      ) {
        maximumLoss = {
          fixedRiderId: fixedRider.riderId,
          lapNumber: primaryLap.lapNumber,
          lossSec,
          fixedRiderOrder,
        };
      }
    }
  }

  if (!maximumLoss) return null;
  return {
    fixedRiderId: maximumLoss.fixedRiderId,
    lapNumber: maximumLoss.lapNumber,
    lossSec: maximumLoss.lossSec,
  };
}

export function buildLapMap(
  rider: Rider,
  timedOnly = false,
): Map<number, LapRecord> {
  const laps = timedOnly ? getValidTimedLaps(rider) : getValidCheckpoints(rider);
  return new Map(laps.map((lap) => [lap.lapNumber, lap]));
}

export type ChartDetailMetricKind = "rank" | "gap" | "pace" | "lap";

export interface ChartDetailResult {
  riderId: string;
  value: number | null;
  rankAtLap: number | null;
}

/** Return sparse, raw detail values for one lap without changing chart data. */
export function buildChartDetail(
  primaryRider: Rider,
  riders: Rider[],
  lapNumber: number,
  metricKind: ChartDetailMetricKind,
): ChartDetailResult[] {
  const isDifference = metricKind === "gap" || metricKind === "pace";
  const displayRiders = isDifference
    ? [
        primaryRider,
        ...riders.filter((rider) => rider.riderId !== primaryRider.riderId),
      ]
    : riders;
  const primaryMap = isDifference
    ? buildLapMap(primaryRider, metricKind === "pace")
    : undefined;

  return displayRiders.map((rider) => {
    const riderMap = buildLapMap(rider, metricKind === "lap" || metricKind === "pace");
    const riderLap = riderMap.get(lapNumber);

    if (metricKind === "rank") {
      return {
        riderId: rider.riderId,
        value: riderLap?.rankAtLap ?? null,
        rankAtLap: riderLap?.rankAtLap ?? null,
      };
    }

    if (metricKind === "lap") {
      return {
        riderId: rider.riderId,
        value: riderLap?.lapTimeSec ?? null,
        rankAtLap: riderLap?.rankAtLap ?? null,
      };
    }

    const primaryLap = primaryMap?.get(lapNumber);
    if (rider.riderId === primaryRider.riderId) {
      return {
        riderId: rider.riderId,
        value: primaryLap ? 0 : null,
        rankAtLap: primaryLap?.rankAtLap ?? null,
      };
    }

    const value =
      primaryLap && riderLap
        ? metricKind === "gap"
          ? riderLap.cumulativeTimeSec - primaryLap.cumulativeTimeSec
          : riderLap.lapTimeSec - primaryLap.lapTimeSec
        : null;

    return {
      riderId: rider.riderId,
      value,
      rankAtLap: value === null ? null : riderLap?.rankAtLap ?? null,
    };
  });
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
  /** Original collector label for numeric ranks with an official annotation. */
  officialPositionLabel: string | null;
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
    officialPositionLabel:
      rider.status === "annotated-rank"
        ? rider.officialPositionLabel ?? null
        : null,
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
  if (isValidRaceLapNumbers(race.raceLapNumbers)) {
    return [...race.raceLapNumbers];
  }

  const lapNumbers = new Set<number>();
  for (const rider of race.riders) {
    for (const lap of getValidCheckpoints(rider)) {
      lapNumbers.add(lap.lapNumber);
    }
  }
  return [...lapNumbers].sort((a, b) => a - b);
}

export function getRaceLapCount(race: RaceResult): number {
  return getRaceLapNumbers(race).length;
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
  lapNumbers: readonly number[],
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

  for (const lapNumber of lapNumbers) {
    const point: GapSeriesPoint = { lapNumber };
    const baseLap = baseMap.get(lapNumber);
    if (!baseLap) {
      points.push(point);
      continue;
    }

    for (const riderId of targetRiderIds) {
      const lap = targetMaps.get(riderId)?.get(lapNumber);
      if (lap) {
        const gapSec = lap.cumulativeTimeSec - baseLap.cumulativeTimeSec;
        if (Number.isFinite(gapSec)) {
          point[riderId] = gapSec;
        }
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
