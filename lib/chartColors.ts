import type { RaceResult } from "@/lib/types";

/** 紙・白背景の双方で3:1以上になるカテゴリカルパレット。 */
const PALETTE = [
  "#005a9c",
  "#b33a00",
  "#007a5e",
  "#7a4e00",
  "#8f3f71",
  "#555555",
  "#5c2d91",
  "#8b1a1a",
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
