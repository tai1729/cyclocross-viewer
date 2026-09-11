"use client";

import type { Rider } from "@/lib/types";
import { LapDetailTable } from "@/components/LapDetailTable";
import { getLapDetailDisclosureLabel } from "@/lib/supportingPresentation";
import { Disclosure } from "@/components/Disclosure";

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
    <Disclosure
      data-lap-detail-disclosure
      open={open}
      className="min-w-0"
      onOpenChange={onOpenChange}
      summary={getLapDetailDisclosureLabel(primaryRider)}
      contentClassName="min-w-0 p-3 sm:p-4"
    >
      <LapDetailTable
        primaryRider={primaryRider}
        fixedRiders={fixedRiders}
      />
    </Disclosure>
  );
}
