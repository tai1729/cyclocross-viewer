import { formatGapSec, type RiderSummary } from "@/lib/dataTransform";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryCardProps {
  summary: RiderSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const {
    position,
    totalRiders,
    topGapSec,
    promotionZoneRank,
    promotionGapSec,
    isInPromotionZone,
  } = summary;

  return (
    <Card size="sm">
      <CardContent className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
      <SummaryItem
        label="順位"
        value={`${position}`}
        unit={`/${totalRiders}`}
      />
      <Separator orientation="vertical" />
      <SummaryItem
        label="トップ差"
        value={position === 1 ? "—" : formatGapSec(topGapSec)}
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
