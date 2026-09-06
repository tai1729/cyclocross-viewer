import { getMeasuredLapRows } from "@/lib/dataTransform";
import type { Rider } from "@/lib/types";

export function getLapDetailDisclosureLabel(primaryRider: Rider): string {
  const measuredLapCount = getMeasuredLapRows(primaryRider).length;

  return measuredLapCount > 0
    ? `ラップ詳細を表示・${measuredLapCount}周・${primaryRider.name}`
    : "ラップ詳細を表示・有効な実測ラップなし";
}

export function getResultsDisclosureLabel(riderCount: number): string {
  return `結果表を表示・${riderCount}名`;
}
