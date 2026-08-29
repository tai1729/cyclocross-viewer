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
  /**
   * design.md 2.4 のスキーマ案には無いMVP-0独自の拡張フィールド。
   * SummaryCardの「昇格圏差」計算に使う昇格ライン（例: 3位以内が昇格）。
   * 最上位カテゴリー（昇格先が無い）の場合はundefined。
   */
  promotionZoneRank?: number;
  riders: Rider[];
}
