import type { RaceResult } from "@/lib/types";
import { formatRaceUpdatedAt, getRaceSourceUrl } from "@/lib/raceMetadata";

interface RaceHeaderProps {
  race: RaceResult;
}

export function RaceHeader({ race }: RaceHeaderProps) {
  const finishedCount = race.riders.filter(
    (rider) => rider.status === "finished",
  ).length;
  const dnfCount = race.riders.length - finishedCount;
  const sourceUrl = getRaceSourceUrl(race.raceId);

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-start justify-between gap-2 border-b border-border bg-background/95 px-1 py-2.5 backdrop-blur">
      <h1 className="min-w-0 break-words text-sm font-semibold text-foreground sm:truncate sm:text-base">
        {race.raceName}
      </h1>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-secondary-foreground">
          {race.category}
        </span>
        <span className="text-xs text-muted-foreground">
          {race.riders.length}名（完走{finishedCount} / DNF {dnfCount}）
        </span>
      </span>
      <div className="basis-full min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="min-w-0 break-words">
          データ更新: {formatRaceUpdatedAt(race.updatedAt)}
        </span>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            className="min-w-0 break-words text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            取得元データ (GitHub)
          </a>
        ) : null}
        <span className="min-w-0 break-words">公式リザルトではありません</span>
      </div>
    </header>
  );
}
