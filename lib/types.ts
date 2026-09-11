export type DataQuality = "ok" | "error";

/** "finished": 完走。 "dnf": 途中棄権（完走者の後ろに連番の順位が割り当てられる）。 */
export type RiderStatus = "finished" | "dnf";

export interface LapRecord {
  lapNumber: number;
  lapTimeSec: number;
  cumulativeTimeSec: number;
  rankAtLap: number;
}

export interface Rider {
  riderId: string;
  name: string;
  finalPosition: number;
  status: RiderStatus;
  laps: LapRecord[];
  dataQuality: DataQuality;
}

export interface RaceResult {
  raceId: string;
  raceName: string;
  category: string;
  updatedAt: string;
  /** Official numbered lap sequence from the collector's lap-table header. */
  raceLapNumbers?: number[];
  /**
   * design.md 2.4 のスキーマ案には無いMVP-0独自の拡張フィールド。
   * SummaryCardの「昇格圏差」計算に使う昇格ライン（例: 3位以内が昇格）。
   * 最上位カテゴリー（昇格先が無い）の場合はundefined。
   */
  promotionZoneRank?: number;
  riders: Rider[];
}

/**
 * Validate the optional official lap axis without sorting, deduplicating, or
 * partially accepting malformed metadata.
 */
export function isValidRaceLapNumbers(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (lapNumber, index) =>
        typeof lapNumber === "number" &&
        Number.isFinite(lapNumber) &&
        Number.isSafeInteger(lapNumber) &&
        lapNumber > 0 &&
        (index === 0 || value[index - 1] < lapNumber),
    )
  );
}

export interface MeetCategory {
  raceId: string;
  name: string;
  order: number;
}

export interface MeetEntry {
  meetId: string;
  season: string;
  meetDate: string;
  series: string;
  meetName: string;
  categories: MeetCategory[];
}
