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
    <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-sm sm:p-3">
      <div className="mb-2 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rank" && (
        <RankBumpChart riders={comparisonRiders} colors={colors} />
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
