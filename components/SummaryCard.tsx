import { formatGapSec, type RaceStory, type RiderSummary } from "@/lib/dataTransform";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryCardProps {
  summary: RiderSummary;
  raceStory?: RaceStory | null;
}

export function SummaryCard({ summary, raceStory }: SummaryCardProps) {
  const {
    result,
    officialPositionLabel,
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
        {raceStory ? <RaceStorySection story={raceStory} /> : null}
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
      {officialPositionLabel ? (
        <CardContent className="border-b border-border/70 pb-3" data-official-position-label>
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              公式表記
            </span>
            <span className="break-words font-mono text-base font-bold tabular-nums text-foreground">
              {officialPositionLabel}
            </span>
          </div>
        </CardContent>
      ) : null}
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
      {raceStory ? <RaceStorySection story={raceStory} /> : null}
    </Card>
  );
}

function RaceStorySection({ story }: { story: RaceStory }) {
  const maximumChange = story.maximumRankChange
    ? `${story.maximumRankChange.positions}つ${
        story.maximumRankChange.direction === "gained" ? "上昇" : "下降"
      }`
    : "—";
  const maximumChangeDetail = story.maximumRankChange
    ? `${story.maximumRankChange.lapNumber}周目`
    : undefined;

  return (
    <CardContent className="border-t border-border/70 pt-3">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            レース展開
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{story.narrative}</p>
        </div>
        <dl className="grid min-w-0 grid-cols-2 gap-3">
          <StoryMetric
            label="最高順位"
            value={story.highestRank ? `${story.highestRank.rank}位` : "—"}
            detail={story.highestRank ? `${story.highestRank.lapNumber}周目` : undefined}
          />
          <StoryMetric
            label="最大の順位変化"
            value={maximumChange}
            detail={maximumChangeDetail}
          />
        </dl>
        <p className="text-xs text-muted-foreground">
          有効な実測ラップと、順位が近い選手の記録をもとにしています。
        </p>
      </div>
    </CardContent>
  );
}

function StoryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="min-w-0 rounded-md bg-muted/50 px-3 py-2.5">
      <dt className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {value}
        </span>
        {detail ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
      </dd>
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
