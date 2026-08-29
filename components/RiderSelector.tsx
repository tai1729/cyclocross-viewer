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
  const [isOpen, setIsOpen] = useState(selectedRiderId === null);

  const selectedRider =
    riders.find((r) => r.riderId === selectedRiderId) ?? null;

  function handleSelect(riderId: string) {
    onSelect(riderId);
    setQuery("");
    setIsOpen(false);
  }

  if (!isOpen && selectedRider) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-paper-line bg-white px-3 py-2.5 text-left"
      >
        <span className="flex items-baseline gap-2 truncate">
          <span className="font-mono text-xs text-ink/45">
            {selectedRider.finalPosition}位
          </span>
          <span className="truncate font-medium text-ink">
            {selectedRider.name}
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium text-flag">変更</span>
      </button>
    );
  }

  const filtered = riders
    .filter((r) => r.name.includes(query))
    .sort((a, b) => a.finalPosition - b.finalPosition);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-paper-line bg-white p-2">
      <input
        type="text"
        autoFocus={selectedRider !== null}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="選手を検索"
        className="w-full rounded-md border border-paper-line bg-paper px-3 py-2 text-sm text-ink focus:border-flag focus:outline-none"
      />
      <div className="flex max-h-64 flex-col overflow-y-auto">
        {filtered.map((rider) => {
          const isSelected = rider.riderId === selectedRiderId;
          return (
            <button
              key={rider.riderId}
              onClick={() => handleSelect(rider.riderId)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                isSelected ? "bg-flag-soft" : "hover:bg-paper"
              }`}
            >
              <span className="w-8 shrink-0 font-mono text-xs text-ink/45">
                {rider.finalPosition}位
              </span>
              <span className="truncate text-ink">{rider.name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-ink/40">
            該当する選手がいません
          </p>
        )}
      </div>
    </div>
  );
}
