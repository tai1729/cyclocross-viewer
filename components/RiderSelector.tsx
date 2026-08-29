"use client";

import { useEffect, useRef, useState } from "react";
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
  const selectedRowRef = useRef<HTMLButtonElement | null>(null);

  const sorted = [...riders].sort((a, b) => a.finalPosition - b.finalPosition);
  const selectedIndex = sorted.findIndex((r) => r.riderId === selectedRiderId);
  const selectedRider = selectedIndex !== -1 ? sorted[selectedIndex] : null;
  const prevRider = selectedIndex > 0 ? sorted[selectedIndex - 1] : null;
  const nextRider =
    selectedIndex !== -1 && selectedIndex < sorted.length - 1
      ? sorted[selectedIndex + 1]
      : null;

  function positionLabel(rider: Rider): string {
    return rider.status === "dnf" ? "DNF" : `${rider.finalPosition}位`;
  }

  function handleSelect(riderId: string) {
    onSelect(riderId);
    setQuery("");
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen && query === "") {
      selectedRowRef.current?.scrollIntoView({ block: "center" });
    }
    // 開いた瞬間だけ選択中の行までスクロールしたいので、isOpen変化時のみ実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen && selectedRider) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => prevRider && handleSelect(prevRider.riderId)}
          disabled={!prevRider}
          aria-label="一つ上の順位の選手へ"
          className="shrink-0 rounded-lg border border-paper-line bg-white px-2.5 py-2.5 text-ink/60 disabled:opacity-30"
        >
          ▲
        </button>
        <button
          onClick={() => setIsOpen(true)}
          className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-paper-line bg-white px-3 py-2.5 text-left"
        >
          <span className="flex items-baseline gap-2 truncate">
            <span
              className={`font-mono text-xs ${
                selectedRider.status === "dnf" ? "text-flag" : "text-ink/45"
              }`}
            >
              {positionLabel(selectedRider)}
            </span>
            <span className="truncate font-medium text-ink">
              {selectedRider.name}
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium text-flag">変更</span>
        </button>
        <button
          onClick={() => nextRider && handleSelect(nextRider.riderId)}
          disabled={!nextRider}
          aria-label="一つ下の順位の選手へ"
          className="shrink-0 rounded-lg border border-paper-line bg-white px-2.5 py-2.5 text-ink/60 disabled:opacity-30"
        >
          ▼
        </button>
      </div>
    );
  }

  const filtered = sorted.filter((r) => r.name.includes(query));

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
              ref={isSelected ? selectedRowRef : undefined}
              onClick={() => handleSelect(rider.riderId)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                isSelected ? "bg-flag-soft" : "hover:bg-paper"
              }`}
            >
              <span
                className={`w-8 shrink-0 font-mono text-xs ${
                  rider.status === "dnf" ? "text-flag" : "text-ink/45"
                }`}
              >
                {positionLabel(rider)}
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
