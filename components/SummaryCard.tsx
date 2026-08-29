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
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <SummaryItem label="順位" value={`${position}位 / ${totalRiders}名`} />
      <SummaryItem
        label="トップ差"
        value={position === 1 ? "―" : formatGapSec(topGapSec)}
      />
      <SummaryItem
        label={
          promotionZoneRank !== null
            ? `昇格圏(${promotionZoneRank}位)差`
            : "昇格圏差"
        }
        value={
          promotionZoneRank === null
            ? "―"
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
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xs text-zinc-500 sm:text-sm">{label}</span>
      <span
        className={`text-lg font-bold tabular-nums sm:text-xl ${
          emphasize ? "text-emerald-600" : "text-zinc-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
