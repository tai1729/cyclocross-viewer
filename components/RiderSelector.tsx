"use client";

import { useEffect, useRef, useState } from "react";
import type { Rider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { normalizeSearchText } from "@/lib/search";

interface RiderSelectorProps {
  riders: Rider[];
  categoryName: string;
  selectedRiderId: string | null;
  onSelect: (riderId: string) => void;
}

export function RiderSelector({
  riders,
  categoryName,
  selectedRiderId,
  onSelect,
}: RiderSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(selectedRiderId === null);
  const [shouldFocusSearch, setShouldFocusSearch] = useState(false);
  const selectedRowRef = useRef<HTMLButtonElement | null>(null);
  const riderListRef = useRef<HTMLDivElement | null>(null);
  const selectedControlRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusAfterSelectionRef = useRef(false);
  const previousSelectedRiderIdRef = useRef(selectedRiderId);

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
    if (selectedRider) restoreFocusAfterSelectionRef.current = true;
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
      const list = riderListRef.current;
      const row = selectedRowRef.current;
      if (list && row) {
        const listRect = list.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        if (rowRect.top < listRect.top) {
          list.scrollTop -= listRect.top - rowRect.top;
        } else if (rowRect.bottom > listRect.bottom) {
          list.scrollTop += rowRect.bottom - listRect.bottom;
        }
      }
    }
    // 開いた瞬間だけ選択中の行までスクロールしたいので、isOpen変化時のみ実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && restoreFocusAfterSelectionRef.current) {
      selectedControlRef.current?.focus();
      restoreFocusAfterSelectionRef.current = false;
    }
  }, [isOpen, selectedRiderId]);

  useEffect(() => {
    if (previousSelectedRiderIdRef.current === null && selectedRiderId !== null) {
      setIsOpen(false);
    }
    previousSelectedRiderIdRef.current = selectedRiderId;
  }, [selectedRiderId]);

  if (!isOpen && selectedRider) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => prevRider && handleSelect(prevRider.riderId)}
          disabled={!prevRider}
          aria-label="一つ上の順位の選手へ"
          variant="outline"
          size="icon"
          className="size-11 sm:size-8"
        >
          ▲
        </Button>
        <Button
          ref={selectedControlRef}
          data-race-rider-trigger
          onClick={openSelector}
          variant="outline"
          className="min-h-11 min-w-0 flex-1 justify-between sm:min-h-8"
        >
          <span className="flex items-baseline gap-2 truncate">
            <span
              className={`font-mono text-xs ${
                selectedRider.status === "dnf" ? "text-flag" : "text-muted-foreground"
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
          className="size-11 sm:size-8"
        >
          ▼
        </Button>
      </div>
    );
  }

  const normalizedQuery = normalizeSearchText(query);
  const filtered = sorted.filter((r) =>
    normalizeSearchText(r.name).includes(normalizedQuery),
  );

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>選手を選ぶ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
      <Field>
        <FieldLabel htmlFor="rider-search">選手名を検索</FieldLabel>
        <Input
          id="rider-search"
          type="text"
          autoFocus={selectedRider !== null && shouldFocusSearch}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="選手を検索"
          aria-describedby="rider-search-description"
          className="min-h-11 w-full md:min-h-8"
        />
        <FieldDescription id="rider-search-description">
          {categoryName}内の選手名が検索対象です。
        </FieldDescription>
      </Field>
      <div ref={riderListRef} className="flex max-h-64 flex-col overflow-y-auto">
        {filtered.map((rider) => {
          const isSelected = rider.riderId === selectedRiderId;
          return (
            <button
              key={rider.riderId}
              ref={isSelected ? selectedRowRef : undefined}
              onClick={() => handleSelect(rider.riderId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  restoreFocusAfterSelectionRef.current = true;
                }
              }}
              aria-pressed={isSelected}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50",
                isSelected ? "bg-accent font-bold text-accent-foreground ring-1 ring-foreground/60" : "hover:bg-muted",
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
              {isSelected && <span className="ml-auto shrink-0 text-xs">選択中</span>}
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
