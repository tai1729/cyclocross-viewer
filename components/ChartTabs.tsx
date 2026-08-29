"use client";

import { useState } from "react";
import type { RaceResult, Rider } from "@/lib/types";
import { RankBumpChart } from "@/components/RankBumpChart";
import { GapChart } from "@/components/GapChart";
import { LapTimeChart } from "@/components/LapTimeChart";

type TabKey = "rank" | "gap" | "lap";

const TABS: { key: TabKey; label: string }[] = [
  { key: "rank", label: "順位" },
  { key: "gap", label: "ギャップ" },
  { key: "lap", label: "ラップ" },
];

interface ChartTabsProps {
  race: RaceResult;
  selfRider: Rider;
  comparisonRiders: Rider[];
  colors: Record<string, string>;
}

export function ChartTabs({
  race,
  selfRider,
  comparisonRiders,
  colors,
}: ChartTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("rank");
  const otherRiders = comparisonRiders.filter(
    (r) => r.riderId !== selfRider.riderId,
  );

  return (
    <div className="rounded-lg border border-paper-line bg-white p-2 shadow-sm sm:p-3">
      <div className="mb-3 flex border-b border-paper-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 border-b-2 px-2 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-flag text-ink"
                : "border-transparent text-ink/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rank" && (
        <RankBumpChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
        />
      )}
      {activeTab === "gap" && (
        <GapChart
          race={race}
          baseRider={selfRider}
          otherRiders={otherRiders}
          colors={colors}
        />
      )}
      {activeTab === "lap" && (
        <LapTimeChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
        />
      )}
    </div>
  );
}
