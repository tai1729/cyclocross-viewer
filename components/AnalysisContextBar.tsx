import type { Rider } from "@/lib/types";
import type { RiderResult } from "@/lib/dataTransform";
import type { ChartTab, ComparisonMode } from "@/lib/urlState";
import { cn } from "@/lib/utils";

interface AnalysisContextBarProps {
  raceName: string;
  categoryName: string;
  riderName: string;
  riderStatus: string;
  comparisonMode: string;
  displayedCount: number;
  comparisonNames?: readonly string[];
  activeMetric: string;
  presentation?: "desktop" | "mobile";
}

export function getAnalysisMetricLabel(tab: ChartTab): string {
  switch (tab) {
    case "gap":
      return "タイム差";
    case "pace":
      return "周回差";
    case "lap":
      return "ラップ";
    case "rank":
    default:
      return "順位";
  }
}

export function getAnalysisComparisonLabel(mode: ComparisonMode): string {
  if (mode === "pinned") return "固定比較";
  if (mode === "all") return "全員";
  return `±${mode}`;
}

export function getAnalysisComparisonNamesLabel(
  names: readonly string[],
  comparisonMode: string,
): string {
  if (names.length === 0) return comparisonMode === "固定比較" ? "選択なし" : "なし";

  const visibleNames = comparisonMode === "固定比較" ? names : names.slice(0, 4);
  const remainingCount = names.length - visibleNames.length;
  return remainingCount > 0
    ? `${visibleNames.join("、")}、ほか${remainingCount}名`
    : visibleNames.join("、");
}

export function getAnalysisRiderStatus(
  rider: Rider,
  result: RiderResult | null,
): string {
  if (!result) return rider.status === "dnf" ? "DNF" : "順位確認不可";

  switch (result.kind) {
    case "finished":
      return `${result.position}位・完走`;
    case "lapped":
      return `${result.position}位・-${result.lapDeficit}周`;
    case "dnf":
      return result.finalCheckpointRank === null
        ? "DNF・周回記録なし"
        : `DNF・最終通過${result.finalCheckpointRank}位`;
    case "unavailable":
      switch (result.reason) {
        case "data-quality":
          return "データ異常・分析不可";
        case "no-checkpoints":
          return "周回記録なし・分析不可";
        case "no-leader":
          return "順位確認不可・分析不可";
      }
  }
}

export function AnalysisContextBar({
  raceName,
  categoryName,
  riderName,
  riderStatus,
  comparisonMode,
  displayedCount,
  comparisonNames = [],
  activeMetric,
  presentation = "desktop",
}: AnalysisContextBarProps) {
  const isMobilePresentation = presentation === "mobile";

  return (
    <div
      data-analysis-context-bar
      className={cn(
        "min-w-0 rounded-lg border border-border bg-muted/20 px-3 py-3 sm:px-4",
        isMobilePresentation && "py-2",
      )}
      aria-label="分析コンテキスト"
    >
      <dl
        className={cn(
          "grid min-w-0 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4",
          isMobilePresentation && "grid-cols-2 gap-x-3",
        )}
      >
        <ContextItem
          label="大会"
          value={raceName}
          className={cn("lg:col-span-2", isMobilePresentation && "col-span-2")}
        />
        <ContextItem label="カテゴリー" value={categoryName} />
        <ContextItem label="注目選手" value={`${riderName}・${riderStatus}`} />
        <ContextItem label="比較する選手" value={`${comparisonMode}・${displayedCount}名表示`} />
        <ContextItem
          label="比較中の名前"
          value={getAnalysisComparisonNamesLabel(comparisonNames, comparisonMode)}
        />
        <ContextItem label="表示中の指標" value={activeMetric} />
      </dl>
    </div>
  );
}

function ContextItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}
