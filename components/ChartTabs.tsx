"use client";

import { useMemo } from "react";
import type { RaceResult, Rider } from "@/lib/types";
import { getRaceLapNumbers } from "@/lib/dataTransform";
import {
  buildRiderSeriesStyles,
  type RiderSeriesStyle,
} from "@/lib/chartSeriesStyles";
import { getChartReadingGuide } from "@/lib/chartReadingGuide";
import type { ChartTab } from "@/lib/urlState";
import { RankBumpChart } from "@/components/RankBumpChart";
import { GapChart } from "@/components/GapChart";
import { PaceChart } from "@/components/PaceChart";
import { LapTimeChart } from "@/components/LapTimeChart";
import { SeriesMarkerDot } from "@/components/SeriesMarkerDot";
import { ChartDetailPanel } from "@/components/ChartDetailPanel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_ALL_COMPARISON_RIDERS } from "@/hooks/useComparisonRiders";

type TabKey = ChartTab;

const TABS: {
  key: TabKey;
  label: string;
  mobileLabel: string;
}[] = [
  {
    key: "rank",
    label: "順位",
    mobileLabel: "順位",
  },
  {
    key: "gap",
    label: "タイム差",
    mobileLabel: "差",
  },
  {
    key: "pace",
    label: "周回差",
    mobileLabel: "周回",
  },
  {
    key: "lap",
    label: "ラップ",
    mobileLabel: "ラップ",
  },
];

const CHART_READING_GUIDE_ID = "chart-reading-guide";
const CHART_INTERACTION_HINT =
  "グラフの点をクリックするか、周回セレクターで周回を固定すると、各選手の値を確認できます。ホバーは一時表示です。";

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
  const readingGuide = getChartReadingGuide(activeTab);
  const seriesStyles = buildRiderSeriesStyles(
    comparisonRiders,
    selfRider.riderId,
    fixedRiderIds,
  );
  const riderNames = Object.fromEntries(
    comparisonRiders.map((rider) => [rider.riderId, rider.name]),
  );
  const isCrowded = isAllMode || comparisonRiders.length > 8;
  const showContextDetails =
    isCrowded && !isAllMode && comparisonRiders.length <= 12;
  const comparisonIdentity = getComparisonIdentity(
    selfRider,
    otherRiders,
    isAllMode,
  );

  return (
    <Card
      data-chart-stage
      role="region"
      aria-label={comparisonIdentity}
      className="w-full min-w-0 border border-foreground/15 shadow-sm"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (TABS.some((tab) => tab.key === value)) onTabChange(value as TabKey);
        }}
        className="contents"
      >
        <CardHeader className="gap-2 px-3 pt-3 pb-0 sm:px-4 sm:pt-4">
          <div
            data-chart-stage-context
            className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <p data-chart-comparison className="sr-only">
              {comparisonIdentity}
            </p>
            <p
              data-chart-metric
              className="min-w-0 break-words text-xs text-muted-foreground"
            >
              表示: <span className="font-medium text-foreground">{readingGuide.label}</span>
            </p>
          </div>
          <TabsList
            variant="line"
            className="w-full min-w-0 border-b border-border/60 pb-1"
            aria-describedby={CHART_READING_GUIDE_ID}
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                aria-label={tab.label}
                className="min-h-11 min-w-0 px-1 text-muted-foreground data-active:font-bold data-active:text-foreground lg:min-h-8 lg:px-1.5"
              >
                <span aria-hidden="true" className="lg:hidden">
                  {tab.mobileLabel}
                </span>
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-2 px-3 pt-1 pb-3 sm:px-4 sm:pb-4">
          <p
            id={CHART_READING_GUIDE_ID}
            className="text-xs leading-snug text-muted-foreground sm:text-sm"
          >
            <span className="font-medium text-foreground">
              {readingGuide.label}
            </span>{" "}
            {readingGuide.text}
          </p>

          <TabsContent value="rank">
            <figure data-chart-plot className="min-w-0">
              <figcaption className="sr-only">
                各周回終了時点の実測順位を階段状で示します。線の途中の順位を推定していません。注目選手と比較する選手の順位推移で、1位が上です。
              </figcaption>
              <RankBumpChart
                riders={comparisonRiders}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                isCrowded={isCrowded}
                showContextDetails={showContextDetails}
                raceLapNumbers={raceLapNumbers}
                activeLapNumber={activeLapNumber}
                onLapHover={handleLapHover}
                onLapSelect={handleLapSelect}
              />
            </figure>
            {activeTab === "rank" ? (
              <>
                <ChartSeriesKey
                  riders={comparisonRiders}
                  seriesStyles={seriesStyles}
                  isAllMode={isAllMode}
                />
                <ChartInteractionHint />
              </>
            ) : null}
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
              <figure data-chart-plot className="min-w-0">
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
                  showContextDetails={showContextDetails}
                  raceLapNumbers={raceLapNumbers}
                  activeLapNumber={activeLapNumber}
                  onLapHover={handleLapHover}
                  onLapSelect={handleLapSelect}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
            {activeTab === "gap" ? (
              <>
                <ChartSeriesKey
                  riders={comparisonRiders}
                  seriesStyles={seriesStyles}
                  isAllMode={isAllMode}
                />
                <ChartInteractionHint />
              </>
            ) : null}
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
              <figure data-chart-plot className="min-w-0">
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
                  showContextDetails={showContextDetails}
                  raceLapNumbers={raceLapNumbers}
                  activeLapNumber={activeLapNumber}
                  onLapHover={handleLapHover}
                  onLapSelect={handleLapSelect}
                />
              </figure>
            ) : (
              <NoComparisonRiders />
            )}
            {activeTab === "pace" ? (
              <>
                <ChartSeriesKey
                  riders={comparisonRiders}
                  seriesStyles={seriesStyles}
                  isAllMode={isAllMode}
                />
                <ChartInteractionHint />
              </>
            ) : null}
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
            <figure data-chart-plot className="min-w-0">
              <figcaption className="sr-only">
                注目選手と比較する選手の、周回ごとの実測ラップタイム推移。下ほど速いです。
              </figcaption>
              <LapTimeChart
                riders={comparisonRiders}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                isCrowded={isCrowded}
                showContextDetails={showContextDetails}
                raceLapNumbers={raceLapNumbers}
                activeLapNumber={activeLapNumber}
                onLapHover={handleLapHover}
                onLapSelect={handleLapSelect}
              />
            </figure>
            {activeTab === "lap" ? (
              <>
                <ChartSeriesKey
                  riders={comparisonRiders}
                  seriesStyles={seriesStyles}
                  isAllMode={isAllMode}
                />
                <ChartInteractionHint />
              </>
            ) : null}
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

function ChartSeriesKey({
  riders,
  seriesStyles,
  isAllMode,
}: {
  riders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  isAllMode: boolean;
}) {
  const uniqueRiders = riders.filter(
    (rider, index, allRiders) =>
      allRiders.findIndex((candidate) => candidate.riderId === rider.riderId) ===
      index,
  );
  const shouldSummarize =
    isAllMode && uniqueRiders.length > MAX_ALL_COMPARISON_RIDERS;
  const visibleRiders = shouldSummarize
    ? uniqueRiders.filter(
        (rider) => seriesStyles[rider.riderId]?.role !== "context",
      )
    : uniqueRiders;
  const contextRiderCount = uniqueRiders.filter(
    (rider) => seriesStyles[rider.riderId]?.role === "context",
  ).length;

  return (
    <ul
      data-chart-series-key
      aria-label="比較チャートの線"
      className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-2 rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs"
    >
      {visibleRiders.map((rider) => {
        const style = seriesStyles[rider.riderId];
        return (
          <li
            key={rider.riderId}
            data-chart-series-role={style.role}
            data-chart-series-marker={style.marker}
            data-chart-series-dasharray={style.strokeDasharray ?? "solid"}
            className="flex min-w-0 max-w-full items-center gap-1.5"
          >
            <span
              aria-hidden="true"
              className="inline-flex w-8 shrink-0 items-center justify-between"
              style={{
                color: style.color,
              }}
            >
              <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 12 12">
                <SeriesMarkerDot
                  marker={style.marker}
                  cx={6}
                  cy={6}
                  size={3.5}
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth={1.25}
                />
              </svg>
              <svg
                aria-hidden="true"
                className="h-3 w-4"
                viewBox="0 0 16 4"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="16"
                  y2="2"
                  stroke="currentColor"
                  strokeWidth={Math.max(2, style.strokeWidth)}
                  strokeDasharray={style.strokeDasharray}
                />
              </svg>
            </span>
            <span className="min-w-0 break-words">
              {style.roleLabel}・{rider.name}
            </span>
          </li>
        );
      })}
      {shouldSummarize && contextRiderCount > 0 ? (
        <li
          data-chart-series-role="context-summary"
          data-chart-series-marker="ring"
          data-chart-series-dasharray="5 4"
          className="flex min-w-0 max-w-full items-center gap-1.5"
        >
          <span
            aria-hidden="true"
            className="inline-flex w-8 shrink-0 items-center justify-between"
            style={{
              color: "currentColor",
            }}
          >
            <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 12 12">
              <SeriesMarkerDot
                marker="ring"
                cx={6}
                cy={6}
                size={3.5}
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={1.25}
              />
            </svg>
            <svg
              aria-hidden="true"
              className="h-3 w-4"
              viewBox="0 0 16 4"
            >
              <line
                x1="0"
                y1="2"
                x2="16"
                y2="2"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="5 4"
              />
            </svg>
          </span>
          <span className="min-w-0 break-words">
            参考選手・ほか{contextRiderCount}名（全{uniqueRiders.length}名）
          </span>
        </li>
      ) : null}
    </ul>
  );
}

function ChartInteractionHint() {
  return (
    <p
      data-chart-interaction-hint
      className="min-w-0 break-words text-xs text-muted-foreground"
    >
      <span className="font-medium text-foreground">操作:</span>{" "}
      {CHART_INTERACTION_HINT}
    </p>
  );
}

function getComparisonIdentity(
  primaryRider: Rider,
  otherRiders: Rider[],
  isAllMode: boolean,
): string {
  const primaryLabel = `注目選手 ${primaryRider.name}`;
  if (isAllMode) return `${primaryLabel} vs 全員（${otherRiders.length}名）`;
  if (otherRiders.length === 0) return `${primaryLabel} vs 比較対象なし`;
  if (otherRiders.length === 1) {
    return `${primaryLabel} vs ${otherRiders[0].name}`;
  }

  const namedRiders = otherRiders.slice(0, 2).map((rider) => rider.name);
  const remainingCount = otherRiders.length - namedRiders.length;
  return `${primaryLabel} vs ${namedRiders.join("・")}${
    remainingCount > 0 ? `・ほか${remainingCount}名` : ""
  }`;
}

function NoComparisonRiders() {
  return (
    <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border px-4 text-center text-sm text-muted-foreground sm:h-[22rem] lg:h-[30rem]">
      比較できる周回データを持つ選手がほかにいません。
    </div>
  );
}
