import type { Rider } from "@/lib/types";

export type RiderSeriesRole = "primary" | "fixed" | "context";

export interface RiderSeriesStyle {
  role: RiderSeriesRole;
  color: string;
  opacity: number;
  strokeWidth: number;
  strokeDasharray?: string;
  roleLabel: string;
}

export const FIXED_RIDER_COLORS = [
  "#005a9c",
  "#b33a00",
  "#007a5e",
  "#7a4e00",
] as const;

export const PRIMARY_RIDER_STYLE = {
  role: "primary",
  color: "#292722",
  opacity: 1,
  strokeWidth: 3.5,
  roleLabel: "注目選手",
} satisfies RiderSeriesStyle;

export const FIXED_RIDER_STYLE = {
  role: "fixed",
  opacity: 0.95,
  strokeWidth: 2.5,
  roleLabel: "固定比較",
} as const;

export const CONTEXT_RIDER_STYLE = {
  role: "context",
  color: "#77736b",
  opacity: 0.5,
  strokeWidth: 1.5,
  strokeDasharray: "5 4",
  roleLabel: "参考選手",
} satisfies RiderSeriesStyle;

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
  for (const rider of riders) {
    const { riderId } = rider;
    if (riderId in styles) {
      continue;
    }

    if (riderId === primaryRiderId) {
      styles[riderId] = { ...PRIMARY_RIDER_STYLE };
      continue;
    }

    const fixedColorIndex = fixedRiderIds.indexOf(riderId);
    if (fixedRiderIdSet.has(riderId)) {
      styles[riderId] = {
        ...FIXED_RIDER_STYLE,
        color: FIXED_RIDER_COLORS[fixedColorIndex % FIXED_RIDER_COLORS.length],
      };
      continue;
    }

    styles[riderId] = { ...CONTEXT_RIDER_STYLE };
  }

  return styles;
}
