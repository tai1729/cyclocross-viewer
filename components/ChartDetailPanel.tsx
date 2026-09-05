"use client";

import { useId } from "react";
import type { ChartDetailMetricKind } from "@/lib/dataTransform";
import {
  buildChartDetail,
  formatGapSec,
  formatSecToClock,
} from "@/lib/dataTransform";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";
import type { Rider } from "@/lib/types";

interface ChartDetailPanelProps {
  metricKind: ChartDetailMetricKind;
  primaryRider: Rider;
  riders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  raceLapNumbers: readonly number[];
  activeLapNumber: number | null;
  isPinned: boolean;
  onLapChange: (lapNumber: number) => void;
  onClearPin: () => void;
}

const METRIC_LABELS: Record<ChartDetailMetricKind, string> = {
  rank: "順位",
  gap: "タイム差",
  pace: "周回差",
  lap: "ラップタイム",
};

export function ChartDetailPanel({
  metricKind,
  primaryRider,
  riders,
  seriesStyles,
  raceLapNumbers,
  activeLapNumber,
  isPinned,
  onLapChange,
  onClearPin,
}: ChartDetailPanelProps) {
  const headingId = useId();
  const hasRaceAxis = raceLapNumbers.length > 0;
  const selectedLapNumber = getSelectedLapNumber(
    raceLapNumbers,
    activeLapNumber,
  );
  const selectedLapIndex = selectedLapNumber === null
    ? -1
    : raceLapNumbers.indexOf(selectedLapNumber);
  const isDifferenceMetric = metricKind === "gap" || metricKind === "pace";
  const noComparisonRiders = isDifferenceMetric && riders.length === 0;
  const detailRows =
    selectedLapNumber === null || noComparisonRiders
      ? []
      : buildChartDetail(
          primaryRider,
          riders,
          selectedLapNumber,
          metricKind,
        );
  const riderNames = new Map(
    [primaryRider, ...riders].map((rider) => [rider.riderId, rider.name]),
  );
  const previousDisabled = !hasRaceAxis || selectedLapIndex <= 0;
  const nextDisabled =
    !hasRaceAxis || selectedLapIndex === raceLapNumbers.length - 1;

  return (
    <section
      aria-labelledby={headingId}
      data-chart-detail-panel={metricKind}
      data-detail-lap={selectedLapNumber === null ? "unavailable" : selectedLapNumber}
      className="flex min-h-[13rem] min-w-0 flex-col gap-3 overflow-hidden rounded-lg border border-border bg-card p-3 text-card-foreground sm:p-4"
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={headingId}
            aria-live="polite"
            className="break-words text-sm font-semibold"
          >
            {selectedLapNumber === null
              ? "選択中の周回: 利用できません"
              : `選択中の周回: ${selectedLapNumber}周目`}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
            {isPinned ? "周回を固定中" : "周回を選択すると詳細を表示します"}
          </p>
        </div>

        {isPinned ? (
          <button
            type="button"
            onClick={onClearPin}
            className="min-h-11 shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            固定を解除
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor={`${headingId}-lap`} className="shrink-0 text-sm font-medium">
          周回を選択
        </label>
        <select
          id={`${headingId}-lap`}
          value={selectedLapNumber ?? ""}
          disabled={!hasRaceAxis}
          onChange={(event) => onLapChange(Number(event.target.value))}
          aria-label="詳細を表示する周回"
          className="min-h-11 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
        >
          {hasRaceAxis ? (
            raceLapNumbers.map((lapNumber) => (
              <option key={lapNumber} value={lapNumber}>
                {lapNumber}周目
              </option>
            ))
          ) : (
            <option value="">周回データなし</option>
          )}
        </select>
        <div className="flex min-w-0 gap-2">
          <button
            type="button"
            onClick={() => {
              if (!previousDisabled) {
                onLapChange(raceLapNumbers[selectedLapIndex - 1]);
              }
            }}
            disabled={previousDisabled}
            className="min-h-11 min-w-0 flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            前の周回
          </button>
          <button
            type="button"
            onClick={() => {
              if (!nextDisabled) {
                onLapChange(raceLapNumbers[selectedLapIndex + 1]);
              }
            }}
            disabled={nextDisabled}
            className="min-h-11 min-w-0 flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            次の周回
          </button>
        </div>
      </div>

      {!hasRaceAxis ? (
        <p
          role="status"
          aria-live="polite"
          className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground"
        >
          周回軸がないため、詳細を表示できません
        </p>
      ) : (
        <div className="min-h-0 min-w-0 flex-1">
          {noComparisonRiders ? (
            <p
              role="status"
              className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground"
            >
              比較対象なし
            </p>
          ) : (
            <div
              aria-label={`${METRIC_LABELS[metricKind]}の周回詳細`}
              className="max-h-40 min-w-0 overflow-x-hidden overflow-y-auto rounded-md border border-border"
            >
              {detailRows.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">
                  表示できる選手がいません
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {detailRows.map((detail) => {
                    const riderName =
                      detail.riderId === primaryRider.riderId
                        ? primaryRider.name
                        : riderNames.get(detail.riderId) ?? detail.riderId;
                    const valueText = formatDetailValue(metricKind, detail.value);
                    const rankText =
                      metricKind !== "rank" && detail.value !== null && detail.rankAtLap !== null
                        ? ` (${detail.rankAtLap}位)`
                        : "";
                    const roleLabel =
                      seriesStyles[detail.riderId]?.roleLabel ||
                      (detail.riderId === primaryRider.riderId
                        ? "注目選手"
                        : "参考選手");

                    return (
                      <li
                        key={detail.riderId}
                        className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 py-2.5 text-sm"
                      >
                        <span className="min-w-0 break-words font-medium">
                          <span className="text-muted-foreground">
                            {roleLabel}：
                          </span>{" "}
                          {riderName}
                        </span>
                        <span className="shrink-0 font-mono tabular-nums">
                          {valueText}
                          {rankText}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function getSelectedLapNumber(
  raceLapNumbers: readonly number[],
  activeLapNumber: number | null,
): number | null {
  if (raceLapNumbers.length === 0) return null;
  return activeLapNumber !== null && raceLapNumbers.includes(activeLapNumber)
    ? activeLapNumber
    : raceLapNumbers[0];
}

function formatDetailValue(
  metricKind: ChartDetailMetricKind,
  value: number | null,
): string {
  if (value === null) return "未計測";
  if (metricKind === "rank") return `${value}位`;
  if (metricKind === "lap") return formatSecToClock(value);
  return formatGapSec(value);
}
