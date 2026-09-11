"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComparisonMode } from "@/hooks/useComparisonRiders";
import type { Rider } from "@/lib/types";
import { getAnalysisComparisonLabel } from "@/components/AnalysisContextBar";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";
import { Disclosure } from "@/components/Disclosure";

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
    <Disclosure
      data-mobile-comparison-disclosure
      open={isOpen}
      className="min-w-0"
      onOpenChange={setIsOpen}
      summaryRef={summaryRef}
      summary={(
        <>
          <span className="shrink-0">比較する選手</span>
          <span className="min-w-0 break-words text-right text-sm font-normal">
            {getAnalysisComparisonLabel(mode)}・現在{displayedCount}名
          </span>
        </>
      )}
    >
      <div className="min-w-0 p-3">
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
    </Disclosure>
  );
}
