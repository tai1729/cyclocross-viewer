import type { RaceResult } from "@/lib/types";

/** dataviz skillの検証済みカテゴリカルパレット（先頭6色、ライトモード用）。 */
const PALETTE = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
];

/**
 * 全選手の最終順位順に色を固定割当する。
 * 比較対象（表示する選手のサブセット）が変わっても、
 * 同じ選手には常に同じ色を使う（色は選手個人に紐づく、順位には紐づかない）。
 */
export function buildRiderColorMap(race: RaceResult): Record<string, string> {
  const sorted = [...race.riders].sort(
    (a, b) => a.finalPosition - b.finalPosition,
  );
  const map: Record<string, string> = {};
  sorted.forEach((rider, i) => {
    map[rider.riderId] = PALETTE[i % PALETTE.length];
  });
  return map;
}
