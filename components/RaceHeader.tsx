import type { ReactNode } from "react";
import Link from "next/link";
import type { RaceResult } from "@/lib/types";
import { formatRaceUpdatedAt, getRaceSourceUrl } from "@/lib/raceMetadata";

interface RaceHeaderProps {
  race: RaceResult;
  listHref: string;
  meetName: string;
  categorySelector: ReactNode;
  resultsAction?: ReactNode;
}

export function RaceHeader({
  race,
  listHref,
  meetName,
  categorySelector,
  resultsAction,
}: RaceHeaderProps) {
  const finishedCount = race.riders.filter(
    (rider) => rider.status === "finished",
  ).length;
  const dnfCount = race.riders.length - finishedCount;
  const sourceUrl = getRaceSourceUrl(race.raceId);

  return (
    <>
      <header
        data-race-header
        className="sticky top-0 z-20 -mx-1 flex min-w-0 flex-col gap-1.5 border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur"
      >
      <div
        data-race-header-navigation
        className="flex min-w-0 items-start justify-between gap-3 text-sm"
      >
        <Link
          href={listHref}
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-flag underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-8"
        >
          ← 大会一覧
        </Link>
        <span className="max-[359px]:hidden min-w-0 flex-1 break-words text-right text-muted-foreground sm:truncate">
          {meetName}
        </span>
      </div>
      <div data-race-header-category className="min-w-0">
        {categorySelector}
      </div>
      </header>
      <div className="flex min-w-0 flex-col gap-1.5 px-1 py-1.5">
        <div className="flex min-w-0 items-start gap-2">
        <h1 className="min-w-0 flex-1 break-words text-sm font-semibold text-foreground sm:truncate sm:text-base">
          {race.raceName}
        </h1>
        </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-secondary-foreground">
            {race.category}
          </span>
          <span className="max-[359px]:hidden text-xs text-muted-foreground">
            {race.riders.length}名（完走{finishedCount} / DNF {dnfCount}）
          </span>
        </span>
        {resultsAction ? <div className="shrink-0">{resultsAction}</div> : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="max-[359px]:hidden min-w-0 break-words">
          データ更新: {formatRaceUpdatedAt(race.updatedAt)}
        </span>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            className="hidden min-w-0 break-words text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline"
          >
            取得元データ (GitHub)
          </a>
        ) : null}
        <span className="hidden min-w-0 break-words sm:inline">公式リザルトではありません</span>
      </div>
      </div>
    </>
  );
}
