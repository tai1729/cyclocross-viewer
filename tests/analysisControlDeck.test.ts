import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AnalysisControlDeck } from "@/components/AnalysisControlDeck";
import type { Rider } from "@/lib/types";

function rider(riderId: string, name: string, finalPosition: number): Rider {
  return {
    riderId,
    name,
    finalPosition,
    status: "finished",
    dataQuality: "ok",
    laps: [
      {
        lapNumber: 1,
        lapTimeSec: 60,
        cumulativeTimeSec: 60,
        rankAtLap: finalPosition,
      },
    ],
  };
}

test("analysis control deck exposes current rider and comparison identity", () => {
  const riders = [
    rider("primary", "和田 良平", 1),
    rider("challenger", "黒田 将広", 2),
    rider("third", "日比 正明", 3),
  ];
  const html = renderToStaticMarkup(
    createElement(AnalysisControlDeck, {
      riders,
      graphableRiders: riders,
      categoryName: "ME1",
      selectedRiderId: "primary",
      comparisonRiders: riders,
      comparisonMode: 2,
      displayedCount: 3,
      pinnedCount: 0,
      pinnedRiderIds: [],
      closeKey: "rider=primary",
      isDesktop: true,
      onSelectRider: () => undefined,
      onChangeComparisonMode: () => undefined,
      onAddPinnedRider: () => undefined,
      onRemovePinnedRider: () => undefined,
    }),
  );

  assert.match(html, /data-analysis-identity[^>]*>和田 良平 vs 黒田 将広 \/ 日比 正明/);
  assert.match(html, /注目選手/);
  assert.match(html, /比較する選手/);
});
