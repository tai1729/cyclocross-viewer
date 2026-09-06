"use client";

import type { Rider } from "@/lib/types";
import { LapDetailTable } from "@/components/LapDetailTable";
import { getLapDetailDisclosureLabel } from "@/lib/supportingPresentation";

export interface LapDetailDisclosureProps {
  primaryRider: Rider;
  fixedRiders: Rider[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LapDetailDisclosure({
  primaryRider,
  fixedRiders,
  open,
  onOpenChange,
}: LapDetailDisclosureProps) {
  return (
    <details
      data-lap-detail-disclosure
      open={open}
      onToggle={(event) => onOpenChange(event.currentTarget.open)}
      className="min-w-0"
    >
      <summary className="flex min-h-11 w-full min-w-0 cursor-pointer items-center rounded-lg border border-border bg-card px-3 py-2 font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2">
        <span className="min-w-0 break-words">
          {getLapDetailDisclosureLabel(primaryRider)}
        </span>
      </summary>

      <div className="mt-3 min-w-0">
        <LapDetailTable
          primaryRider={primaryRider}
          fixedRiders={fixedRiders}
        />
      </div>
    </details>
  );
}
