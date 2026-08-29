import type { RaceResult, Rider } from "@/lib/types";

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

/** そのライダーの最終周回時点の累積タイム（秒）。 */
export function getTotalTimeSec(rider: Rider): number {
  const lastLap = rider.laps[rider.laps.length - 1];
  return lastLap ? lastLap.cumulativeTimeSec : 0;
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

export interface RiderSummary {
  position: number;
  totalRiders: number;
  topGapSec: number;
  promotionZoneRank: number | null;
  promotionGapSec: number;
  isInPromotionZone: boolean;
}

export function getRiderSummary(
  race: RaceResult,
  riderId: string,
): RiderSummary | null {
  const rider = getRiderById(race, riderId);
  if (!rider) return null;

  const topRider = getRiderByPosition(race, 1);
  const promotionRider =
    race.promotionZoneRank !== undefined
      ? getRiderByPosition(race, race.promotionZoneRank)
      : undefined;

  const riderTotal = getTotalTimeSec(rider);
  const topGapSec = topRider ? riderTotal - getTotalTimeSec(topRider) : 0;
  const promotionGapSec = promotionRider
    ? riderTotal - getTotalTimeSec(promotionRider)
    : 0;

  return {
    position: rider.finalPosition,
    totalRiders: race.riders.length,
    topGapSec,
    promotionZoneRank: race.promotionZoneRank ?? null,
    promotionGapSec,
    isInPromotionZone:
      race.promotionZoneRank !== undefined &&
      rider.finalPosition <= race.promotionZoneRank,
  };
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

  const lapCount = baseRider.laps.length;
  const points: GapSeriesPoint[] = [];

  for (let i = 0; i < lapCount; i++) {
    const lapNumber = baseRider.laps[i].lapNumber;
    const baseCumulative = baseRider.laps[i].cumulativeTimeSec;
    const point: GapSeriesPoint = { lapNumber };

    for (const riderId of targetRiderIds) {
      const rider = getRiderById(race, riderId);
      const lap = rider?.laps[i];
      if (lap) {
        point[riderId] = lap.cumulativeTimeSec - baseCumulative;
      }
    }
    points.push(point);
  }

  return points;
}
