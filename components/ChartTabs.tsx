"use client";

import { useState } from "react";
import type { RaceResult, Rider } from "@/lib/types";
import { getRaceLapNumbers } from "@/lib/dataTransform";
import { RankBumpChart } from "@/components/RankBumpChart";
import { GapChart } from "@/components/GapChart";
import { PaceChart } from "@/components/PaceChart";
import { LapTimeChart } from "@/components/LapTimeChart";

type TabKey = "rank" | "gap" | "pace" | "lap";

const TABS: { key: TabKey; label: string; howToRead: string }[] = [
  {
    key: "rank",
    label: "順位",
    howToRead: "周回ごとの順位の変化を線で表示。上にあるほど順位が良いです",
  },
  {
    key: "gap",
    label: "ギャップ",
    howToRead:
      "±0があなたの基準。線がプラスならその選手はあなたより遅れ、マイナスなら先行しています",
  },
  {
    key: "pace",
    label: "ペース",
    howToRead:
      "その周だけのタイム差。プラスならその周はあなたが速く（差が縮む）、マイナスなら相手が速い（差が広がる）です",
  },
  {
    key: "lap",
    label: "ラップ",
    howToRead: "各選手の1周ごとのタイム推移。太い線があなたです",
  },
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
  const raceLapNumbers = getRaceLapNumbers(race);
  const activeTabDef = TABS.find((t) => t.key === activeTab) ?? TABS[0];

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

      <p className="mb-2 text-xs text-ink/45">{activeTabDef.howToRead}</p>

      {activeTab === "rank" && (
        <RankBumpChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
          raceLapNumbers={raceLapNumbers}
        />
      )}
      {activeTab === "gap" && (
        otherRiders.length > 0 ? (
          <GapChart
            race={race}
            baseRider={selfRider}
            otherRiders={otherRiders}
            colors={colors}
          />
        ) : (
          <NoComparisonRiders />
        )
      )}
      {activeTab === "pace" && (
        otherRiders.length > 0 ? (
          <PaceChart
            race={race}
            baseRider={selfRider}
            otherRiders={otherRiders}
            colors={colors}
          />
        ) : (
          <NoComparisonRiders />
        )
      )}
      {activeTab === "lap" && (
        <LapTimeChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
          raceLapNumbers={raceLapNumbers}
        />
      )}
    </div>
  );
}

function NoComparisonRiders() {
  return (
    <div className="flex h-[416px] items-center justify-center rounded-md border border-dashed border-paper-line px-4 text-center text-sm text-ink/45">
      比較できる周回データを持つ選手がほかにいません。
    </div>
  );
}
