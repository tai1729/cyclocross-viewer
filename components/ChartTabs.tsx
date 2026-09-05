"use client";

import { useMemo } from "react";
import type { RaceResult, Rider } from "@/lib/types";
import { getRaceLapNumbers } from "@/lib/dataTransform";
import { buildRiderSeriesStyles } from "@/lib/chartSeriesStyles";
import type { ChartTab } from "@/lib/urlState";
import { RankBumpChart } from "@/components/RankBumpChart";
import { GapChart } from "@/components/GapChart";
import { PaceChart } from "@/components/PaceChart";
import { LapTimeChart } from "@/components/LapTimeChart";
import { ChartDetailPanel } from "@/components/ChartDetailPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabKey = ChartTab;

const TABS: { key: TabKey; label: string; howToRead: string }[] = [
  {
    key: "rank",
    label: "順位",
    howToRead: "周回ごとの順位の変化を線で表示。上にあるほど順位が良いです",
  },
  {
    key: "gap",
    label: "タイム差",
    howToRead:
      "累積タイム差（各周終了時点）。注目選手が±0の基準です。プラスは比較選手が遅れている（後ろ）、マイナスは先行している（速い）ことを示します",
  },
  {
    key: "pace",
    label: "周回差",
    howToRead:
      "周回ごとのタイム差。注目選手が±0の基準です。プラスは比較選手が遅い（後ろ）、マイナスは速い（前）ことを示します",
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
  fixedRiderIds?: readonly string[];
  isAllMode?: boolean;
  activeTab: TabKey;
  activeLapNumber: number | null;
  pinnedLapNumber: number | null;
  onTabChange: (tab: TabKey) => void;
  onLapHover: (lapNumber: number) => void;
  onLapSelect: (lapNumber: number) => void;
  onLapChange: (lapNumber: number) => void;
  onClearPin: () => void;
}

export function ChartTabs({
  race,
  selfRider,
  comparisonRiders,
  fixedRiderIds = [],
  isAllMode = false,
  activeTab,
  activeLapNumber,
  pinnedLapNumber,
  onTabChange,
  onLapHover,
  onLapSelect,
  onLapChange,
  onClearPin,
}: ChartTabsProps) {
  const raceLapNumbers = useMemo(() => getRaceLapNumbers(race), [race]);

  const handleLapHover = (lapNumber: number) => {
    if (pinnedLapNumber === null && raceLapNumbers.includes(lapNumber)) {
      onLapHover(lapNumber);
    }
  };
  const handleLapSelect = (lapNumber: number) => {
    if (raceLapNumbers.includes(lapNumber)) onLapSelect(lapNumber);
  };
  const handleLapChange = (lapNumber: number) => {
    if (raceLapNumbers.includes(lapNumber)) onLapChange(lapNumber);
  };
  const otherRiders = comparisonRiders.filter(
    (r) => r.riderId !== selfRider.riderId,
  );
  const activeTabDef = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const seriesStyles = buildRiderSeriesStyles(
    comparisonRiders,
    selfRider.riderId,
    fixedRiderIds,
  );
  const riderNames = Object.fromEntries(
    comparisonRiders.map((rider) => [rider.riderId, rider.name]),
  );
  const isCrowded = isAllMode || comparisonRiders.length > 8;

  return (
    <Card>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (TABS.some((tab) => tab.key === value)) onTabChange(value as TabKey);
        }}
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
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                isCrowded={isCrowded}
                raceLapNumbers={raceLapNumbers}
                activeLapNumber={activeLapNumber}
                onLapHover={handleLapHover}
                onLapSelect={handleLapSelect}
              />
            </figure>
            <ChartDetailPanel
              metricKind="rank"
              primaryRider={selfRider}
              riders={comparisonRiders}
              seriesStyles={seriesStyles}
              raceLapNumbers={raceLapNumbers}
              activeLapNumber={activeLapNumber}
              isPinned={pinnedLapNumber !== null}
              onLapChange={handleLapChange}
              onClearPin={onClearPin}
            />
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
                  seriesStyles={seriesStyles}
                  riderNames={riderNames}
                  isCrowded={isCrowded}
                  raceLapNumbers={raceLapNumbers}
                  activeLapNumber={activeLapNumber}
                  onLapHover={handleLapHover}
                  onLapSelect={handleLapSelect}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
            <ChartDetailPanel
              metricKind="gap"
              primaryRider={selfRider}
              riders={otherRiders}
              seriesStyles={seriesStyles}
              raceLapNumbers={raceLapNumbers}
              activeLapNumber={activeLapNumber}
              isPinned={pinnedLapNumber !== null}
              onLapChange={handleLapChange}
              onClearPin={onClearPin}
            />
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
                  seriesStyles={seriesStyles}
                  riderNames={riderNames}
                  isCrowded={isCrowded}
                  raceLapNumbers={raceLapNumbers}
                  activeLapNumber={activeLapNumber}
                  onLapHover={handleLapHover}
                  onLapSelect={handleLapSelect}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
            <ChartDetailPanel
              metricKind="pace"
              primaryRider={selfRider}
              riders={otherRiders}
              seriesStyles={seriesStyles}
              raceLapNumbers={raceLapNumbers}
              activeLapNumber={activeLapNumber}
              isPinned={pinnedLapNumber !== null}
              onLapChange={handleLapChange}
              onClearPin={onClearPin}
            />
          </TabsContent>
          <TabsContent value="lap">
            <figure>
              <figcaption className="sr-only">
                注目選手と比較対象の、周回ごとの実測ラップタイム推移。下ほど速いです。
              </figcaption>
              <LapTimeChart
                riders={comparisonRiders}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                isCrowded={isCrowded}
                raceLapNumbers={raceLapNumbers}
                activeLapNumber={activeLapNumber}
                onLapHover={handleLapHover}
                onLapSelect={handleLapSelect}
              />
            </figure>
            <ChartDetailPanel
              metricKind="lap"
              primaryRider={selfRider}
              riders={comparisonRiders}
              seriesStyles={seriesStyles}
              raceLapNumbers={raceLapNumbers}
              activeLapNumber={activeLapNumber}
              isPinned={pinnedLapNumber !== null}
              onLapChange={handleLapChange}
              onClearPin={onClearPin}
            />
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
