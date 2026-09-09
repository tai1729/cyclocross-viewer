import type { Rider } from "@/lib/types";

export type RiderSeriesRole = "primary" | "fixed" | "context";
export type RiderSeriesMarker =
  | "circle"
  | "square"
  | "diamond"
  | "triangle"
  | "plus"
  | "ring"
  | "cross"
  | "star"
  | "hexagon"
  | "pentagon"
  | "octagon";

export interface RiderSeriesStyle {
  role: RiderSeriesRole;
  color: string;
  opacity: number;
  strokeWidth: number;
  strokeDasharray?: string;
  marker: RiderSeriesMarker;
  roleLabel: string;
}

export const FIXED_RIDER_COLORS = [
  "#005a9c",
  "#b33a00",
  "#007a5e",
  "#7a4e00",
] as const;

export const FIXED_RIDER_DASH_PATTERNS = [
  "7 3",
  "2 3 9 3",
  "11 3",
  "4 2 1 2",
] as const;
export const FIXED_RIDER_MARKERS = [
  "square",
  "diamond",
  "triangle",
  "pentagon",
] as const;

export const PRIMARY_RIDER_STYLE = {
  role: "primary",
  color: "#292722",
  opacity: 1,
  strokeWidth: 3.5,
  marker: "circle",
  roleLabel: "注目選手",
} satisfies RiderSeriesStyle;

export const FIXED_RIDER_STYLE = {
  role: "fixed",
  opacity: 0.95,
  strokeWidth: 2.5,
  marker: "square",
  roleLabel: "固定比較",
} as const;

export const CONTEXT_RIDER_DASH_PATTERNS = [
  "5 4",
  "2 3",
  "9 3 2 3",
  "3 2 1 2",
  "12 3 2 3",
  "1 3",
  "7 2 1 2",
  "10 2 2 2",
  "4 3 1 3",
  "14 3 1 3",
] as const;
export const CONTEXT_RIDER_MARKERS = [
  "ring",
  "cross",
  "plus",
  "star",
  "hexagon",
  "pentagon",
  "diamond",
  "triangle",
  "square",
  "octagon",
] as const;

export const CONTEXT_RIDER_STYLE = {
  role: "context",
  color: "#555555",
  opacity: 0.72,
  strokeWidth: 1.5,
  strokeDasharray: CONTEXT_RIDER_DASH_PATTERNS[0],
  marker: CONTEXT_RIDER_MARKERS[0],
  roleLabel: "参考選手",
} satisfies RiderSeriesStyle;

export const CONTEXT_RIDER_COLORS = [
  CONTEXT_RIDER_STYLE.color,
  "#005a9c",
  "#7a1f5b",
  "#006b5c",
  "#8a4b08",
  "#4b3f8f",
  "#8c1d18",
  "#245a2a",
] as const;

export function buildRiderSeriesStyles(
  riders: Rider[],
  primaryRiderId: string,
  activeFixedRiderIds: readonly string[],
): Record<string, RiderSeriesStyle> {
  const displayedRiderIds = new Set<string>();
  for (const rider of riders) {
    displayedRiderIds.add(rider.riderId);
  }

  const fixedRiderIds: string[] = [];
  const seenFixedRiderIds = new Set<string>();
  for (const riderId of activeFixedRiderIds) {
    if (
      riderId !== primaryRiderId &&
      displayedRiderIds.has(riderId) &&
      !seenFixedRiderIds.has(riderId)
    ) {
      fixedRiderIds.push(riderId);
      seenFixedRiderIds.add(riderId);
    }
  }

  const fixedRiderIdSet = new Set(fixedRiderIds);
  const styles: Record<string, RiderSeriesStyle> = {};
  let contextColorIndex = 0;
  let contextStyleIndex = 0;
  for (const rider of riders) {
    const { riderId } = rider;
    if (riderId in styles) {
      continue;
    }

    if (riderId === primaryRiderId) {
      styles[riderId] = { ...PRIMARY_RIDER_STYLE };
      continue;
    }

    if (fixedRiderIdSet.has(riderId)) {
      const fixedColorIndex = fixedRiderIds.indexOf(riderId);
      styles[riderId] = {
        ...FIXED_RIDER_STYLE,
        color: FIXED_RIDER_COLORS[fixedColorIndex],
        strokeDasharray: FIXED_RIDER_DASH_PATTERNS[fixedColorIndex],
        marker: FIXED_RIDER_MARKERS[fixedColorIndex],
      };
      continue;
    }

    styles[riderId] = {
      ...CONTEXT_RIDER_STYLE,
      color: CONTEXT_RIDER_COLORS[contextColorIndex % CONTEXT_RIDER_COLORS.length],
      strokeDasharray: CONTEXT_RIDER_DASH_PATTERNS[contextStyleIndex],
      marker: CONTEXT_RIDER_MARKERS[contextStyleIndex],
    };
    contextColorIndex += 1;
    contextStyleIndex += 1;
  }

  return styles;
}
