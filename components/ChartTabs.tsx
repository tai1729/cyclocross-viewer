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
      "±0が注目選手の基準。線がプラスならその選手は注目選手より遅れ、マイナスなら先行しています",
  },
  {
    key: "pace",
    label: "ペース",
    howToRead:
      "その周だけのタイム差。プラスならその周は注目選手が速く（差が縮む）、マイナスなら相手が速い（差が広がる）です",
  },
  {
    key: "lap",
    label: "ラップ",
    howToRead: "各選手の1周ごとのタイム推移。太い線が注目選手です",
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
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="contents"
      >
        <CardHeader>
          <TabsList variant="line" className="w-full">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="min-h-11 text-muted-foreground data-active:font-bold data-active:text-foreground sm:min-h-8"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {activeTabDef.howToRead}
          </p>

          <TabsContent value="rank">
            <figure>
              <figcaption className="sr-only">
                注目選手と比較対象の、各周終了時点における順位推移。1位が上です。
              </figcaption>
              <RankBumpChart
                riders={comparisonRiders}
                selfRiderId={selfRider.riderId}
                colors={colors}
                raceLapNumbers={raceLapNumbers}
              />
            </figure>
          </TabsContent>
          <TabsContent value="gap">
            {otherRiders.length > 0 ? (
              <figure>
                <figcaption className="sr-only">
                  {selfRider.name}
                  を基準にした、比較選手との周回終了時点の累積タイム差。
                </figcaption>
                <GapChart
                  race={race}
                  baseRider={selfRider}
                  otherRiders={otherRiders}
                  colors={colors}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
          </TabsContent>
          <TabsContent value="pace">
            {otherRiders.length > 0 ? (
              <figure>
                <figcaption className="sr-only">
                  {selfRider.name}
                  と比較選手の、同じ周回における単周タイム差。
                </figcaption>
                <PaceChart
                  race={race}
                  baseRider={selfRider}
                  otherRiders={otherRiders}
                  colors={colors}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
          </TabsContent>
          <TabsContent value="lap">
            <figure>
              <figcaption className="sr-only">
                注目選手と比較対象の、周回ごとの実測ラップタイム推移。下ほど速いです。
              </figcaption>
              <LapTimeChart
                riders={comparisonRiders}
                selfRiderId={selfRider.riderId}
                colors={colors}
                raceLapNumbers={raceLapNumbers}
              />
            </figure>
          </TabsContent>
        </CardContent>
      </Tabs>
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
