"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComparisonMode } from "@/hooks/useComparisonRiders";
import type { Rider } from "@/lib/types";
import { getAnalysisComparisonLabel } from "@/components/AnalysisContextBar";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";

export interface MobileComparisonDisclosureProps {
  mode: ComparisonMode;
  displayedCount: number;
  totalRiderCount: number;
  pinnedCount?: number;
  onChange: (mode: ComparisonMode) => void;
  riders: Rider[];
  primaryRiderId: string | null;
  pinnedRiderIds: readonly string[];
  onAdd: (riderId: string) => void;
  onRemove: (riderId: string) => void;
}

export function MobileComparisonDisclosure({
  mode,
  displayedCount,
  totalRiderCount,
  pinnedCount,
  onChange,
  riders,
  primaryRiderId,
  pinnedRiderIds,
  onAdd,
  onRemove,
}: MobileComparisonDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const previousVisiblePinnedIdsRef = useRef<string[]>([]);
  const pendingRemovalRef = useRef<string | null>(null);

  const riderIds = useMemo(
    () => new Set(riders.map((rider) => rider.riderId)),
    [riders],
  );
  const visiblePinnedIds = useMemo(
    () => pinnedRiderIds.filter((riderId) => riderIds.has(riderId)),
    [pinnedRiderIds, riderIds],
  );

  useEffect(() => {
    const pendingRemovalId = pendingRemovalRef.current;
    if (
      pendingRemovalId &&
      !visiblePinnedIds.includes(pendingRemovalId)
    ) {
      summaryRef.current?.focus({ preventScroll: true });
      pendingRemovalRef.current = null;
    }

    previousVisiblePinnedIdsRef.current = visiblePinnedIds;
  }, [visiblePinnedIds]);

  const handleRemove = (riderId: string) => {
    if (previousVisiblePinnedIdsRef.current.includes(riderId)) {
      pendingRemovalRef.current = riderId;
    }
    onRemove(riderId);
  };

  return (
    <details
      data-mobile-comparison-disclosure
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="min-w-0"
    >
      <summary
        ref={summaryRef}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
      >
        <span className="shrink-0">比較対象</span>
        <span className="min-w-0 break-words text-right text-sm font-normal">
          {getAnalysisComparisonLabel(mode)}・現在{displayedCount}名
        </span>
      </summary>

      <div className="mt-3 min-w-0">
        <ComparisonAdjuster
          mode={mode}
          displayedCount={displayedCount}
          totalRiderCount={totalRiderCount}
          pinnedCount={pinnedCount}
          onChange={onChange}
          presentation="mobile"
        />

        {mode === "pinned" ? (
          <div className="mt-3 max-h-[min(70dvh,32rem)] min-w-0 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            <ComparisonRiderPicker
              riders={riders}
              primaryRiderId={primaryRiderId}
              pinnedRiderIds={pinnedRiderIds}
              onAdd={onAdd}
              onRemove={handleRemove}
            />
          </div>
        ) : null}
      </div>
    </details>
  );
}
