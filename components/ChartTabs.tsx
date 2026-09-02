"use client";

import { useState } from "react";
import type { RaceResult, Rider } from "@/lib/types";
import { getRaceLapNumbers } from "@/lib/dataTransform";
import { RankBumpChart } from "@/components/RankBumpChart";
import { GapChart } from "@/components/GapChart";
import { PaceChart } from "@/components/PaceChart";
import { LapTimeChart } from "@/components/LapTimeChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
          <TabsList variant="line" className="w-full">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
          >
            {tab.label}
          </TabsTrigger>
        ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{activeTabDef.howToRead}</p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
      <TabsContent value="rank">
        <RankBumpChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
          raceLapNumbers={raceLapNumbers}
        />
      </TabsContent>
      <TabsContent value="gap">
        {otherRiders.length > 0 ? (
          <GapChart
            race={race}
            baseRider={selfRider}
            otherRiders={otherRiders}
            colors={colors}
          />
        ) : (
          <NoComparisonRiders />
        )}
      </TabsContent>
      <TabsContent value="pace">
        {otherRiders.length > 0 ? (
          <PaceChart
            race={race}
            baseRider={selfRider}
            otherRiders={otherRiders}
            colors={colors}
          />
        ) : (
          <NoComparisonRiders />
        )}
      </TabsContent>
      <TabsContent value="lap">
        <LapTimeChart
          riders={comparisonRiders}
          selfRiderId={selfRider.riderId}
          colors={colors}
          raceLapNumbers={raceLapNumbers}
        />
      </TabsContent>
      </Tabs>
      </CardContent>
    </Card>
  );
}

function NoComparisonRiders() {
  return (
    <div className="flex h-[416px] items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
      比較できる周回データを持つ選手がほかにいません。
    </div>
  );
}
