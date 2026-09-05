import type { CSSProperties } from "react";
import type { Rider } from "@/lib/types";
import {
  buildLapDeltaRows,
  formatGapSec,
  formatSecToClock,
  getMeasuredLapRows,
} from "@/lib/dataTransform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LapDetailTableProps {
  primaryRider: Rider;
  fixedRiders: Rider[];
}

export function LapDetailTable({
  primaryRider,
  fixedRiders,
}: LapDetailTableProps) {
  const lapRows = getMeasuredLapRows(primaryRider);
  const deltaRows = buildLapDeltaRows(primaryRider, fixedRiders);
  const fixedColumns = fixedRiders.length
    ? ` repeat(${fixedRiders.length}, minmax(0, 1fr))`
    : "";
  const tableGridStyle = {
    "--lap-table-columns": `minmax(2.75rem, 0.7fr) repeat(3, minmax(0, 1fr))${fixedColumns}`,
  } as CSSProperties;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ラップ詳細</CardTitle>
        <CardDescription>
          {primaryRider.name}の実測ラップです。周回差は正値が固定選手の遅れ、
          負値が固定選手の速さを表します。未計測は同じ周回の有効な記録がない状態です。
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div
          role="table"
          aria-label={`${primaryRider.name}のラップ詳細`}
          aria-colcount={4 + fixedRiders.length}
          aria-rowcount={lapRows.length + 1}
          className="w-full text-sm"
        >
          <div role="rowgroup">
            <div
              role="row"
              style={tableGridStyle}
              className="hidden border-y border-border bg-muted/40 px-2 text-xs text-muted-foreground sm:grid sm:grid-cols-[var(--lap-table-columns)] sm:px-3"
            >
              <div role="columnheader" className="px-2 py-2 font-medium">
                周回
              </div>
              <div role="columnheader" className="px-2 py-2 text-right font-medium">
                ラップタイム
              </div>
              <div role="columnheader" className="px-2 py-2 text-right font-medium">
                累積
              </div>
              <div role="columnheader" className="px-2 py-2 text-right font-medium">
                順位
              </div>
              {fixedRiders.map((rider) => (
                <div
                  key={rider.riderId}
                  role="columnheader"
                  className="min-w-0 break-words px-2 py-2 text-right font-medium"
                >
                  周回差: {rider.name}
                </div>
              ))}
            </div>
          </div>

          <div role="rowgroup">
            {lapRows.length === 0 ? (
              <div
                role="row"
                style={tableGridStyle}
                className="grid grid-cols-2 border-b border-border px-2 sm:grid-cols-[var(--lap-table-columns)] sm:px-3"
              >
                <div
                  role="cell"
                  className="col-span-2 px-2 py-8 text-center text-sm text-muted-foreground sm:col-span-full"
                >
                  有効な実測ラップがありません。
                </div>
              </div>
            ) : (
              lapRows.map((lap) => {
                const deltaRow = deltaRows.find(
                  (candidate) => candidate.lapNumber === lap.lapNumber,
                );

                return (
                  <div
                    key={lap.lapNumber}
                    role="row"
                    style={tableGridStyle}
                    className="grid grid-cols-2 border-b border-border px-2 last:border-b-0 sm:grid-cols-[var(--lap-table-columns)] sm:px-3"
                  >
                    <LapCell label="Lap" value={`#${lap.lapNumber}`} />
                    <LapCell
                      label="ラップタイム"
                      value={formatSecToClock(lap.lapTimeSec)}
                    />
                    <LapCell
                      label="累積"
                      value={formatSecToClock(lap.cumulativeTimeSec)}
                    />
                    <LapCell label="順位" value={String(lap.rankAtLap)} />
                    {fixedRiders.map((rider) => {
                      const delta = deltaRow?.deltas[rider.riderId];

                      return (
                        <div
                          key={rider.riderId}
                          role="cell"
                          aria-label={delta === undefined ? "未計測" : undefined}
                          className="col-span-2 flex min-w-0 items-baseline justify-between gap-3 border-t border-border px-2 py-3 sm:col-span-1 sm:justify-end sm:border-t-0 sm:px-2 sm:py-2"
                        >
                          <span className="min-w-0 break-words text-xs text-muted-foreground sm:hidden">
                            周回差: {rider.name}
                          </span>
                          {delta === undefined ? (
                            <span className="sr-only">未計測</span>
                          ) : (
                            <span className="shrink-0 text-right font-mono tabular-nums">
                              <span>{formatGapSec(delta)}</span>{" "}
                              <span className="text-xs text-muted-foreground">
                                {delta > 0
                                    ? "固定選手が遅い"
                                    : delta < 0
                                    ? "固定選手が速い"
                                    : "同タイム"}
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LapCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      role="cell"
      className="flex min-w-0 items-baseline justify-between gap-3 border-t border-border px-2 py-3 first:border-t-0 sm:justify-end sm:border-t-0 sm:px-2 sm:py-2"
    >
      <span className="min-w-0 break-words text-xs text-muted-foreground sm:hidden">
        {label}
      </span>
      <span className="shrink-0 text-right font-mono tabular-nums">{value}</span>
    </div>
  );
}
