import { useMemo } from "react";
import type { Rider } from "@/lib/types";

interface UseComparisonRidersOptions {
  /** 自分の前後何名を比較対象に含めるか（デフォルト2） */
  spread?: number;
}

/**
 * 自分(selfRiderId)を選択すると、最終順位を基準に前後spread名を
 * 自動的に比較対象として選出する。
 */
export function useComparisonRiders(
  riders: Rider[] | null,
  selfRiderId: string | null,
  { spread = 2 }: UseComparisonRidersOptions = {},
): Rider[] {
  return useMemo(() => {
    if (!riders || !selfRiderId) return [];

    const sorted = [...riders].sort(
      (a, b) => a.finalPosition - b.finalPosition,
    );
    const selfIndex = sorted.findIndex((r) => r.riderId === selfRiderId);
    if (selfIndex === -1) return [];

    const start = Math.max(0, selfIndex - spread);
    const end = Math.min(sorted.length, selfIndex + spread + 1);
    return sorted.slice(start, end);
  }, [riders, selfRiderId, spread]);
}
