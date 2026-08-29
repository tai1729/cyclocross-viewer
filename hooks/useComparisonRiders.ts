import { useMemo } from "react";
import type { Rider } from "@/lib/types";

/** 自分の前後何名を比較対象にするか。"all"なら全選手を対象にする。 */
export type ComparisonMode = 0 | 1 | 2 | 3 | 4 | 5 | "all";

/**
 * 自分(selfRiderId)を選択すると、最終順位を基準に前後mode名（またはmode="all"なら全員）を
 * 自動的に比較対象として選出する。
 */
export function useComparisonRiders(
  riders: Rider[] | null,
  selfRiderId: string | null,
  mode: ComparisonMode = 2,
): Rider[] {
  return useMemo(() => {
    if (!riders || !selfRiderId) return [];

    const sorted = [...riders].sort(
      (a, b) => a.finalPosition - b.finalPosition,
    );
    const selfIndex = sorted.findIndex((r) => r.riderId === selfRiderId);
    if (selfIndex === -1) return [];

    if (mode === "all") return sorted;

    const start = Math.max(0, selfIndex - mode);
    const end = Math.min(sorted.length, selfIndex + mode + 1);
    return sorted.slice(start, end);
  }, [riders, selfRiderId, mode]);
}
