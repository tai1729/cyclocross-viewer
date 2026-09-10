import type { ChartTab } from "@/lib/urlState";

export interface ChartReadingGuide {
  readonly label: string;
  readonly text: string;
}

export const CHART_READING_GUIDES: Readonly<Record<ChartTab, ChartReadingGuide>> = {
  rank: {
    label: "順位",
    text: "各周回終了時点の実測順位を階段状で示します。線の途中の順位を推定していません。数字が小さいほど上位（1位が最良）で、グラフでは上にあるほど良い状態です。",
  },
  gap: {
    label: "タイム差",
    text: "注目選手を±0とした累積タイム差です。プラスは比較選手が遅い・後ろ、マイナスは速い・前を示します。",
  },
  pace: {
    label: "周回差（単周タイム差）",
    text: "注目選手を基準にした同じ周の単周タイム差です。プラスは比較選手が遅い・後ろ、マイナスは速い・前を示し、結果表の-1周（1周遅れ）とは別の指標です。",
  },
  lap: {
    label: "ラップタイム",
    text: "ラップタイムは小さいほど速い値で、グラフでは下にあるほど速い状態です。注目選手の線は強調して表示します。",
  },
};

export function getChartReadingGuide(tab: ChartTab): ChartReadingGuide {
  return CHART_READING_GUIDES[tab];
}
