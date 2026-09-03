import { formatGapSec, type RiderSummary } from "@/lib/dataTransform";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryCardProps {
  summary: RiderSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const {
    result,
    totalRiders,
    promotionZoneRank,
    promotionGapSec,
    isInPromotionZone,
  } = summary;
  if (result.kind === "dnf") {
    return (
      <Card size="sm">
        <CardContent className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-4">
          <SummaryItem label="状態" value="DNF" />
          <SummaryItem
            label="到達周回"
            value={
              result.completedLapNumber === null
                ? "記録なし"
                : `${result.completedLapNumber}周目`
            }
          />
          <SummaryItem
            label="最終通過"
            value={
              result.finalCheckpointRank === null
                ? "—"
                : `${result.finalCheckpointRank}位`
            }
          />
          <SummaryItem
            label="離脱時点の差"
            value={
              result.gapToLeaderAtCheckpointSec === null
                ? "—"
                : formatGapSec(result.gapToLeaderAtCheckpointSec)
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (result.kind === "unavailable") {
    return (
      <Card size="sm">
        <CardContent>
          <SummaryItem
            label="結果"
            value={
              result.reason === "data-quality" ? "分析不可" : "周回記録なし"
            }
          />
        </CardContent>
      </Card>
    );
  }

  const topGap =
    result.kind === "lapped"
      ? `-${result.lapDeficit}周`
      : result.position === 1
        ? "—"
        : formatGapSec(result.gapToLeaderSec);

  return (
    <Card size="sm">
      <CardContent className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
      <SummaryItem
        label="順位"
        value={String(result.position)}
        unit={`/${totalRiders}`}
      />
      <Separator orientation="vertical" />
      <SummaryItem
        label="トップ差"
        value={topGap}
      />
      <Separator orientation="vertical" />
      <SummaryItem
        label={
          promotionZoneRank !== null
            ? `昇格圏(${promotionZoneRank}位)`
            : "昇格圏"
        }
        value={
          promotionZoneRank === null
            ? "—"
            : isInPromotionZone
              ? "圏内"
              : promotionGapSec === null
                ? "—"
                : formatGapSec(promotionGapSec)
        }
        emphasize={isInPromotionZone}
      />
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  unit,
  emphasize,
}: {
  label: string;
  value: string;
  unit?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className={`font-mono text-2xl font-bold tabular-nums sm:text-3xl ${
          emphasize ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
