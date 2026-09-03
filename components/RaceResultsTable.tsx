"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { RaceResult, Rider } from "@/lib/types";
import {
  formatGapSec,
  formatSecToClock,
  getRiderResult,
  type RiderResult,
} from "@/lib/dataTransform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RaceResultsTableProps {
  race: RaceResult;
  selectedRiderId: string | null;
  onSelect: (riderId: string) => void;
  analysisRegionId?: string;
}

function positionLabel(result: RiderResult | null): string {
  return result?.kind === "finished" || result?.kind === "lapped"
    ? String(result.position)
    : "—";
}

function resultLabel(result: RiderResult | null): string {
  if (!result) return "確認不可";

  switch (result.kind) {
    case "finished":
      return result.position === 1
        ? formatSecToClock(result.totalTimeSec)
        : formatGapSec(result.gapToLeaderSec);
    case "lapped":
      return `-${result.lapDeficit}周`;
    case "dnf":
      return result.completedLapNumber === null
        ? "周回記録なし"
        : `${result.completedLapNumber}周目まで`;
    case "unavailable":
      return result.reason === "no-checkpoints" ? "周回記録なし" : "確認不可";
  }
}

function statusLabel(rider: Rider, result: RiderResult | null): string {
  if (result?.kind === "dnf") {
    return result.finalCheckpointRank === null
      ? "DNF"
      : `DNF・最終通過${result.finalCheckpointRank}位`;
  }
  if (result?.kind === "unavailable" && result.reason === "data-quality") {
    return "データ異常";
  }
  return rider.status === "finished" ? "完走" : "DNF";
}

export function RaceResultsTable({
  race,
  selectedRiderId,
  onSelect,
  analysisRegionId,
}: RaceResultsTableProps) {
  const resultRows = useMemo(
    () =>
      [...race.riders]
        .sort((a, b) => a.finalPosition - b.finalPosition)
        .map((rider) => ({
          rider,
          result: getRiderResult(race, rider.riderId),
        })),
    [race],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>リザルト</CardTitle>
        <CardDescription>
          周回データに基づく表示です。選手名を選ぶと周回分析へ進みます。
          {analysisRegionId ? (
            <a
              href={`#${analysisRegionId}`}
              className="ml-1 inline-flex min-h-11 items-center font-medium text-flag underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-8"
            >
              結果表を飛ばして分析操作へ
            </a>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {resultRows.length > 0 ? (
          <div className="max-h-[32rem] overflow-x-hidden overflow-y-auto border-y border-border">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">
                {race.category}の順位、選手、結果、ステータス
              </caption>
              <colgroup>
                <col className="w-10 sm:w-14" />
                <col />
                <col className="w-[4.75rem] sm:w-28" />
                <col className="w-[5.5rem] sm:w-36" />
              </colgroup>
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="px-2 py-2 font-medium sm:px-3">
                    順位
                  </th>
                  <th scope="col" className="px-1 py-2 font-medium sm:px-3">
                    選手
                  </th>
                  <th scope="col" className="px-1 py-2 text-right font-medium sm:px-3">
                    結果
                  </th>
                  <th scope="col" className="px-2 py-2 font-medium sm:px-3">
                    状態
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map(({ rider, result }) => {
                  const isSelected = rider.riderId === selectedRiderId;

                  return (
                    <tr
                      key={rider.riderId}
                      className={cn(
                        "border-b border-border last:border-b-0",
                        isSelected && "bg-accent/70",
                      )}
                    >
                      <td className="px-2 py-1 font-mono tabular-nums text-foreground sm:px-3">
                        {positionLabel(result)}
                      </td>
                      <th scope="row" className="p-0 font-normal">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={`${rider.name}を注目選手として分析${isSelected ? "中" : "する"}`}
                          onClick={() => onSelect(rider.riderId)}
                          onKeyDown={(event) => {
                            if (
                              (event.key === "Enter" || event.key === " ") &&
                              analysisRegionId
                            ) {
                              requestAnimationFrame(() => {
                                document.getElementById(analysisRegionId)?.focus();
                              });
                            }
                          }}
                          className="flex min-h-11 w-full items-center gap-1.5 px-1 py-2 text-left font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring sm:px-3"
                        >
                          {isSelected ? <Check aria-hidden="true" data-icon="inline-start" /> : null}
                          <span className="min-w-0 break-words">
                            {rider.name}
                            {isSelected ? (
                              <span className="ml-1 block text-xs font-semibold text-primary sm:inline">
                                分析中
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </th>
                      <td className="break-words px-1 py-2 text-right font-mono text-xs tabular-nums text-foreground sm:px-3 sm:text-sm">
                        {resultLabel(result)}
                      </td>
                      <td className="break-words px-2 py-2 text-xs font-medium text-foreground sm:px-3">
                        {statusLabel(rider, result)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border-y border-border px-4 py-8 text-center text-sm text-muted-foreground">
            このカテゴリーには選手データがありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
