"use client";

import type { ComparisonMode } from "@/hooks/useComparisonRiders";
import type { Rider } from "@/lib/types";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";
import { MobileComparisonDisclosure } from "@/components/MobileComparisonDisclosure";
import { RiderSelector } from "@/components/RiderSelector";
import { Disclosure } from "@/components/Disclosure";
import {
  getAnalysisComparisonIdentityLabel,
  getAnalysisComparisonLabel,
} from "@/components/AnalysisContextBar";

interface AnalysisControlDeckProps {
  riders: Rider[];
  graphableRiders: Rider[];
  categoryName: string;
  selectedRiderId: string | null;
  comparisonRiders: Rider[];
  comparisonMode: ComparisonMode;
  displayedCount: number;
  pinnedCount: number;
  pinnedRiderIds: readonly string[];
  closeKey: string;
  isDesktop: boolean;
  onSelectRider: (riderId: string) => void;
  onChangeComparisonMode: (mode: ComparisonMode) => void;
  onAddPinnedRider: (riderId: string) => void;
  onRemovePinnedRider: (riderId: string) => void;
}

export function AnalysisControlDeck({
  riders,
  graphableRiders,
  categoryName,
  selectedRiderId,
  comparisonRiders,
  comparisonMode,
  displayedCount,
  pinnedCount,
  pinnedRiderIds,
  closeKey,
  isDesktop,
  onSelectRider,
  onChangeComparisonMode,
  onAddPinnedRider,
  onRemovePinnedRider,
}: AnalysisControlDeckProps) {
  const selectedRider = riders.find((rider) => rider.riderId === selectedRiderId);
  const comparisonNames = comparisonRiders
    .filter((rider) => rider.riderId !== selectedRiderId)
    .map((rider) => rider.name);
  const comparisonIdentity = selectedRider
    ? getAnalysisComparisonIdentityLabel(
        selectedRider.name,
        comparisonNames,
        getAnalysisComparisonLabel(comparisonMode),
      )
    : "比較対象を選択してください";

  return (
    <div
      data-analysis-control-deck
      className="max-[359px]:p-1 min-w-0 rounded-lg border border-border bg-card/70 p-2 sm:p-2.5"
    >
      <div className="mb-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 max-[359px]:mb-0">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          分析対象
        </p>
        <p
          data-analysis-identity
          className="min-w-0 break-words text-xs font-semibold text-foreground"
        >
          {comparisonIdentity}
        </p>
      </div>

      <div className="grid min-w-0 gap-2 max-[359px]:gap-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] lg:gap-4">
        <div className="min-w-0">
          <RiderSelector
            riders={riders}
            categoryName={categoryName}
            selectedRiderId={selectedRiderId}
            onSelect={onSelectRider}
            presentation={isDesktop ? "inline" : "mobile-modal"}
            closeKey={closeKey}
          />
        </div>

        <div className="min-w-0">
          {isDesktop ? (
            <Disclosure
              data-desktop-comparison-disclosure
              summary={(
                <>
                  <span>比較する選手</span>
                  <span className="min-w-0 break-words text-right text-sm font-normal">
                    {getAnalysisComparisonLabel(comparisonMode)}・現在{displayedCount}名
                  </span>
                </>
              )}
              contentClassName="flex min-w-0 flex-col gap-3 p-3"
            >
              <ComparisonAdjuster
                mode={comparisonMode}
                displayedCount={displayedCount}
                totalRiderCount={graphableRiders.length}
                pinnedCount={pinnedCount}
                onChange={onChangeComparisonMode}
              />
              {comparisonMode === "pinned" ? (
                <div className="min-w-0">
                  <ComparisonRiderPicker
                    riders={graphableRiders}
                    primaryRiderId={selectedRiderId}
                    pinnedRiderIds={pinnedRiderIds}
                    onAdd={onAddPinnedRider}
                    onRemove={onRemovePinnedRider}
                  />
                </div>
              ) : null}
            </Disclosure>
          ) : (
            <MobileComparisonDisclosure
              mode={comparisonMode}
              displayedCount={displayedCount}
              totalRiderCount={graphableRiders.length}
              pinnedCount={pinnedCount}
              onChange={onChangeComparisonMode}
              riders={graphableRiders}
              primaryRiderId={selectedRiderId}
              pinnedRiderIds={pinnedRiderIds}
              onAdd={onAddPinnedRider}
              onRemove={onRemovePinnedRider}
            />
          )}
        </div>
      </div>
    </div>
  );
}
