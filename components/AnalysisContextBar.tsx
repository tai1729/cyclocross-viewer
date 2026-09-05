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
  activeMetric: string;
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
  if (mode === "pinned") return "固定";
  if (mode === "all") return "全員";
  return `±${mode}`;
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
  activeMetric,
}: AnalysisContextBarProps) {
  return (
    <div
      data-analysis-context-bar
      className="min-w-0 rounded-lg border border-border bg-muted/20 px-3 py-3 sm:px-4"
      aria-label="分析コンテキスト"
    >
      <dl className="grid min-w-0 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <ContextItem label="大会" value={raceName} className="lg:col-span-2" />
        <ContextItem label="カテゴリー" value={categoryName} />
        <ContextItem label="注目選手" value={`${riderName}・${riderStatus}`} />
        <ContextItem label="比較" value={`${comparisonMode}・${displayedCount}名表示`} />
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
