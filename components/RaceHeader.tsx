import type { RaceResult } from "@/lib/types";

interface RaceHeaderProps {
  race: RaceResult;
}

export function RaceHeader({ race }: RaceHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-paper-line bg-paper/95 px-1 py-2.5 backdrop-blur">
      <h1 className="min-w-0 truncate text-sm font-semibold text-ink sm:text-base">
        {race.raceName}
      </h1>
      <span className="shrink-0 rounded-sm bg-ink px-2 py-0.5 font-mono text-xs font-bold tracking-wide text-paper">
        {race.category}
      </span>
    </header>
  );
}
