"use client";

import { useState } from "react";
import type { Rider } from "@/lib/types";

interface RiderSelectorProps {
  riders: Rider[];
  selectedRiderId: string | null;
  onSelect: (riderId: string) => void;
}

export function RiderSelector({
  riders,
  selectedRiderId,
  onSelect,
}: RiderSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = riders
    .filter((r) => r.name.includes(query))
    .sort((a, b) => a.finalPosition - b.finalPosition);

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 bg-zinc-50 py-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="選手を検索"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtered.map((rider) => {
          const isSelected = rider.riderId === selectedRiderId;
          return (
            <button
              key={rider.riderId}
              onClick={() => onSelect(rider.riderId)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              {rider.finalPosition}位 {rider.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
