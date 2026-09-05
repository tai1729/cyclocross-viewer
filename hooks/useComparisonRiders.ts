import { useMemo } from "react";
import type { Rider } from "@/lib/types";

/** 自分の前後何名を比較対象にするか。"all"なら全選手を対象にする。 */
export type ComparisonMode = 0 | 1 | 2 | 3 | 4 | 5 | "pinned" | "all";

/** 凡例とtooltipを判読可能なまま全員比較できる上限。 */
export const MAX_ALL_COMPARISON_RIDERS = 8;
export const MAX_PINNED_COMPARISON_RIDERS = 5;
export const MAX_PINNED_FIXED_RIDERS = MAX_PINNED_COMPARISON_RIDERS - 1;

function compareByFinalPosition(a: Rider, b: Rider): number {
  return a.finalPosition - b.finalPosition;
}

function comparePinnedRiders(a: Rider, b: Rider): number {
  const positionDifference = compareByFinalPosition(a, b);
  if (positionDifference !== 0) return positionDifference;
  return a.riderId < b.riderId ? -1 : a.riderId > b.riderId ? 1 : 0;
}

/** Selects comparison riders without owning any selection state. */
export function getComparisonRiders(
  riders: Rider[] | null,
  selfRiderId: string | null,
  mode: ComparisonMode = 2,
  fixedRiderIds: readonly string[] = [],
): Rider[] {
  if (!riders || !selfRiderId) return [];

  const sorted = [...riders].sort(compareByFinalPosition);
  const selfIndex = sorted.findIndex((rider) => rider.riderId === selfRiderId);
  if (selfIndex === -1) return [];

  if (mode === "all") return sorted;

  if (mode === "pinned") {
    const fixedIds = new Set<string>();
    const fixedRiders = fixedRiderIds
      .filter((riderId) => {
        if (!riderId || riderId === selfRiderId || fixedIds.has(riderId)) {
          return false;
        }
        const rider = sorted.find((candidate) => candidate.riderId === riderId);
        if (!rider) return false;
        fixedIds.add(riderId);
        return true;
      })
      .map((riderId) => sorted.find((rider) => rider.riderId === riderId))
      .filter((rider): rider is Rider => rider !== undefined)
      .sort(comparePinnedRiders)
      .slice(0, MAX_PINNED_FIXED_RIDERS);

    return [sorted[selfIndex], ...fixedRiders];
  }

  const start = Math.max(0, selfIndex - mode);
  const end = Math.min(sorted.length, selfIndex + mode + 1);
  return sorted.slice(start, end);
}

/**
 * 自分(selfRiderId)を選択すると、最終順位を基準に前後mode名（またはmode="all"なら全員）を
 * 自動的に比較対象として選出する。
 */
export function useComparisonRiders(
  riders: Rider[] | null,
  selfRiderId: string | null,
  mode: ComparisonMode = 2,
  fixedRiderIds: readonly string[] = [],
): Rider[] {
  return useMemo(
    () => getComparisonRiders(riders, selfRiderId, mode, fixedRiderIds),
    [riders, selfRiderId, mode, fixedRiderIds],
  );
}
