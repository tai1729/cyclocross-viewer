import {
  formatGapSec,
  formatSecToClock,
  getLapStatistics,
  getMaximumLapLoss,
} from "@/lib/dataTransform";
import type { Rider } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LapSummaryCardProps {
  primaryRider: Rider;
  fixedRiders: Rider[];
}

export function LapSummaryCard({
  primaryRider,
  fixedRiders,
}: LapSummaryCardProps) {
  const statistics = getLapStatistics(primaryRider);
  const maximumLoss =
    fixedRiders.length > 0
      ? getMaximumLapLoss(primaryRider, fixedRiders)
      : null;
  const maximumLossRider = maximumLoss
    ? fixedRiders.find((rider) => rider.riderId === maximumLoss.fixedRiderId)
    : undefined;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <h3>ラップサマリー</h3>
        </CardTitle>
        <CardDescription className="min-w-0 break-words">
          {primaryRider.name}の実測ラップ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statistics.fastestLap === null ||
        statistics.averageLapTimeSec === null ? (
          <p
            role="status"
            className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground"
          >
            有効な実測ラップがありません。
          </p>
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <SummaryMetric
                label="最速ラップ"
                value={formatSecToClock(statistics.fastestLap.lapTimeSec)}
                detail={`${statistics.fastestLap.lapNumber}周目`}
              />
              <SummaryMetric
                label="平均ラップ"
                value={formatSecToClock(statistics.averageLapTimeSec)}
              />
            </dl>

            {maximumLoss &&
            maximumLoss.lossSec > 0 &&
            fixedRiders.length > 0 &&
            maximumLossRider ? (
              <dl className="min-w-0 border-t border-border pt-3">
                <dt className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  最大損失
                </dt>
                <dd className="mt-1 min-w-0 break-words text-sm text-foreground">
                  <span className="font-medium break-words">
                    {maximumLossRider.name}
                  </span>
                  <span className="text-muted-foreground">・</span>
                  <span>{maximumLoss.lapNumber}周目</span>
                  <span className="text-muted-foreground">・選択選手のロス </span>
                  <span className="font-mono font-semibold tabular-nums whitespace-nowrap">
                    {formatGapSec(maximumLoss.lossSec)}
                  </span>
                </dd>
              </dl>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryMetric({
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
        <span className="font-mono text-xl font-semibold tabular-nums whitespace-nowrap text-foreground">
          {value}
        </span>
        {detail ? (
          <span className="text-sm text-muted-foreground">{detail}</span>
        ) : null}
      </dd>
    </div>
  );
}
