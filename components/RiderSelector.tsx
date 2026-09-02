"use client";

import { useEffect, useRef, useState } from "react";
import type { Rider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
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

  function openSelector() {
    setShouldFocusSearch(window.matchMedia("(min-width: 768px)").matches);
    setIsOpen(true);
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
        <Button
          onClick={() => prevRider && handleSelect(prevRider.riderId)}
          disabled={!prevRider}
          aria-label="一つ上の順位の選手へ"
          variant="outline"
          size="icon"
        >
          ▲
        </Button>
        <Button
          onClick={openSelector}
          variant="outline"
          className="min-w-0 flex-1 justify-between"
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
        </Button>
        <Button
          onClick={() => nextRider && handleSelect(nextRider.riderId)}
          disabled={!nextRider}
          aria-label="一つ下の順位の選手へ"
          variant="outline"
          size="icon"
        >
          ▼
        </Button>
      </div>
    );
  }

  const filtered = sorted.filter((r) => r.name.includes(query));

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>選手を選ぶ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
      <Input
        type="text"
        autoFocus={selectedRider !== null && shouldFocusSearch}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="選手を検索"
        className="w-full"
      />
      <div className="flex max-h-64 flex-col overflow-y-auto">
        {filtered.map((rider) => {
          const isSelected = rider.riderId === selectedRiderId;
          return (
            <button
              key={rider.riderId}
              ref={isSelected ? selectedRowRef : undefined}
              onClick={() => handleSelect(rider.riderId)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "w-8 shrink-0 font-mono text-xs",
                  rider.status === "dnf" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {positionLabel(rider)}
              </span>
              <span className="truncate text-foreground">{rider.name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground">
            該当する選手がいません
          </p>
        )}
      </div>
      </CardContent>
    </Card>
  );
}
