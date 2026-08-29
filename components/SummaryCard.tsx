import { formatGapSec, type RiderSummary } from "@/lib/dataTransform";

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
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-ink shadow-sm">
      <SummaryItem
        label="順位"
        value={`${position}`}
        unit={`/${totalRiders}`}
      />
      <SummaryItem
        label="トップ差"
        value={position === 1 ? "—" : formatGapSec(topGapSec)}
      />
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
    </div>
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
    <div className="flex flex-col items-center gap-1.5 bg-ink-soft px-2 py-4">
      <span className="text-[10px] font-medium tracking-widest text-paper/45 uppercase">
        {label}
      </span>
      <span
        className={`font-mono text-2xl font-bold tabular-nums sm:text-3xl ${
          emphasize ? "text-flag" : "text-paper"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-paper/40">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
