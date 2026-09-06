"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";
import type { Rider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { normalizeSearchText } from "@/lib/search";

interface MobileRiderPickerDialogProps {
  riders: Rider[];
  categoryName: string;
  selectedRiderId: string | null;
  open: boolean;
  closeKey?: string | number;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onSelect: (riderId: string) => void;
  onClose: () => void;
}

function positionLabel(rider: Rider): string {
  return rider.status === "dnf" ? "DNF" : `${rider.finalPosition}位`;
}

export function MobileRiderPickerDialog({
  riders,
  categoryName,
  selectedRiderId,
  open,
  closeKey,
  triggerRef,
  onSelect,
  onClose,
}: MobileRiderPickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const riderListRef = useRef<HTMLDivElement | null>(null);
  const selectedRowRef = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState("");
  const wasOpenRef = useRef(false);
  const previousCloseKeyRef = useRef(closeKey);

  const sorted = [...riders].sort((a, b) => a.finalPosition - b.finalPosition);
  const filtered = sorted.filter((rider) =>
    normalizeSearchText(rider.name).includes(normalizeSearchText(query)),
  );

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open) {
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
      wasOpenRef.current = true;
      searchRef.current?.focus({ preventScroll: true });
      return;
    }

    if (dialog?.open) {
      dialog.close();
    }
  }, [open, triggerRef]);

  useEffect(() => {
    if (previousCloseKeyRef.current !== closeKey) {
      previousCloseKeyRef.current = closeKey;
      if (open) {
        onClose();
      }
    }
  }, [closeKey, onClose, open]);

  useEffect(() => {
    if (!open || query !== "") {
      return;
    }

    const list = riderListRef.current;
    const row = selectedRowRef.current;
    if (!list || !row) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    if (rowRect.top < listRect.top) {
      list.scrollTop -= listRect.top - rowRect.top;
    } else if (rowRect.bottom > listRect.bottom) {
      list.scrollTop += rowRect.bottom - listRect.bottom;
    }
  }, [open, query, selectedRiderId]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleSelect(riderId: string) {
    onSelect(riderId);
    onClose();
  }

  function handleNativeClose() {
    setQuery("");
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus({ preventScroll: true });
    }
    if (open) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mobile-rider-picker-title"
      aria-modal="true"
      className="rider-picker-dialog"
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="rider-picker-dialog__content">
        <div className="flex items-center justify-between gap-3">
          <h2 id="mobile-rider-picker-title" className="text-base font-semibold">
            選手を選ぶ
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="閉じる"
            onClick={onClose}
          >
            ×
          </Button>
        </div>

        <label htmlFor="mobile-rider-search" className="mt-3 text-sm font-medium">
          選手名を検索
        </label>
        <Input
          ref={searchRef}
          id="mobile-rider-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="選手を検索"
          aria-describedby="mobile-rider-search-description"
          className="mt-2 min-h-11"
        />
        <p id="mobile-rider-search-description" className="mt-2 text-sm text-muted-foreground">
          {categoryName}内の選手名が検索対象です。
        </p>

        <div ref={riderListRef} className="rider-picker-dialog__list mt-3 flex flex-col">
          {filtered.map((rider) => {
            const isSelected = rider.riderId === selectedRiderId;
            const label = `${positionLabel(rider)} ${rider.name}${isSelected ? "（選択中）" : ""}`;
            return (
              <button
                key={rider.riderId}
                ref={isSelected ? selectedRowRef : undefined}
                type="button"
                onClick={() => handleSelect(rider.riderId)}
                aria-label={label}
                aria-pressed={isSelected}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50",
                  isSelected
                    ? "bg-accent font-bold text-accent-foreground ring-1 ring-foreground/60"
                    : "hover:bg-muted",
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
      </div>
    </dialog>
  );
}
