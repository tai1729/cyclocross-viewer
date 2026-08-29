import type { RaceResult } from "@/lib/types";

interface RaceHeaderProps {
  race: RaceResult;
}

export function RaceHeader({ race }: RaceHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/95 px-1 py-2 backdrop-blur">
      <h1 className="text-sm font-semibold text-zinc-800 sm:text-base">
        {race.raceName}
        <span className="ml-2 text-xs font-normal text-zinc-500">
          {race.category}
        </span>
      </h1>
    </header>
  );
}
