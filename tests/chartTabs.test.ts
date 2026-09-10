import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChartTabs } from "@/components/ChartTabs";
import type { RaceResult, Rider } from "@/lib/types";

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
        lapTimeSec: 60 + finalPosition,
        cumulativeTimeSec: 60 + finalPosition,
        rankAtLap: finalPosition,
      },
    ],
  };
}

const race: RaceResult = {
  raceId: "race-1",
  raceName: "テストレース",
  category: "テストカテゴリー",
  updatedAt: "2026-01-01T00:00:00Z",
  riders: [],
};

function renderChartTabs(
  comparisonRiders: Rider[],
  activeTab: "rank" | "gap" = "rank",
  isAllMode = false,
  fixedRiderIds?: string[],
) {
  return renderToStaticMarkup(
    createElement(ChartTabs, {
      race,
      selfRider: comparisonRiders[0],
      comparisonRiders,
      isAllMode,
      fixedRiderIds:
        fixedRiderIds ??
        (!isAllMode && comparisonRiders.length > 1
          ? [comparisonRiders[1].riderId]
          : []),
      activeTab,
      activeLapNumber: 1,
      pinnedLapNumber: null,
      onTabChange: () => undefined,
      onLapHover: () => undefined,
      onLapSelect: () => undefined,
      onLapChange: () => undefined,
      onClearPin: () => undefined,
    }),
  );
}

test("renders one shared rider key for the active metric with role and name text", () => {
  const html = renderChartTabs([
    rider("primary", "注目太郎", 1),
    rider("fixed", "固定花子", 2),
    rider("context", "参考次郎", 3),
  ]);

  assert.equal((html.match(/data-chart-series-key/g) ?? []).length, 1);
  assert.match(html, /注目選手・注目太郎/);
  assert.match(html, /固定比較・固定花子/);
  assert.match(html, /参考選手・参考次郎/);
});

test("presents chart context and keeps plot, key, and detail adjacent", () => {
  const html = renderChartTabs([
    rider("primary", "Primary Rider", 1),
    rider("fixed", "Challenger", 2),
  ], "gap");

  assert.match(html, /data-chart-stage="true"/);
  assert.match(html, /data-chart-comparison[^>]*>[^<]*Primary Rider vs Challenger/);
  assert.match(html, /data-chart-metric[^>]*>表示: <span[^>]*>タイム差/);

  const plotIndex = html.indexOf("data-chart-plot");
  const keyIndex = html.indexOf("data-chart-series-key");
  const hintIndex = html.indexOf("data-chart-interaction-hint");
  const detailIndex = html.indexOf('data-chart-detail-panel="gap"');
  assert.ok(plotIndex >= 0 && plotIndex < keyIndex);
  assert.ok(keyIndex < hintIndex && hintIndex < detailIndex);
});

test("keeps the chart key and interaction context safe to wrap on narrow widths", () => {
  const html = renderChartTabs([
    rider("primary", "Primary Rider", 1),
    rider("fixed", "Challenger", 2),
  ]);

  assert.match(
    html,
    /data-chart-series-key[^>]*class="[^"]*min-w-0[^"]*flex-wrap[^"]*rounded-md/,
  );
  assert.match(html, /data-chart-series-role="fixed"[^>]*class="[^"]*max-w-full/);
  assert.match(html, /data-chart-interaction-hint[^>]*class="[^"]*break-words/);
  assert.equal((html.match(/data-chart-series-key/g) ?? []).length, 1);
});

test("exposes distinct fixed and context markers and dash patterns in the shared key", () => {
  const html = renderChartTabs(
    [
      rider("primary", "注目太郎", 1),
      rider("fixed-a", "固定花子", 2),
      rider("fixed-b", "固定次郎", 3),
      rider("context-a", "参考三郎", 4),
      rider("context-b", "参考四郎", 5),
    ],
    "rank",
    false,
    ["fixed-a", "fixed-b"],
  );

  assert.match(
    html,
    /data-chart-series-role="fixed" data-chart-series-marker="square" data-chart-series-dasharray="7 3"/,
  );
  assert.match(
    html,
    /data-chart-series-role="fixed" data-chart-series-marker="diamond" data-chart-series-dasharray="2 3 9 3"/,
  );
  assert.match(
    html,
    /data-chart-series-role="context" data-chart-series-marker="ring" data-chart-series-dasharray="5 4"/,
  );
  assert.match(
    html,
    /data-chart-series-role="context" data-chart-series-marker="cross" data-chart-series-dasharray="2 3"/,
  );
  assert.match(html, /<svg aria-hidden="true" class="h-3 w-3" viewBox="0 0 12 12">/);
});

test("keeps the key marker contract available through the full supported cardinality", () => {
  const fixedRiders = Array.from({ length: 4 }, (_, index) =>
    rider(`fixed-${index}`, `固定${index}`, index + 2),
  );
  const contextRiders = Array.from({ length: 10 }, (_, index) =>
    rider(`context-${index}`, `参考${index}`, index + 6),
  );
  const html = renderChartTabs(
    [rider("primary", "注目", 1), ...fixedRiders, ...contextRiders],
    "rank",
    false,
    fixedRiders.map((item) => item.riderId),
  );

  assert.equal((html.match(/data-chart-series-marker=/g) ?? []).length, 15);
  assert.match(html, /data-chart-series-marker="pentagon"/);
  assert.match(html, /data-chart-series-marker="hexagon"/);
  assert.match(html, /data-chart-series-marker="octagon"/);
  assert.match(html, /data-chart-series-dasharray="14 3 1 3"/);
  assert.match(html, /data-chart-series-role="primary" data-chart-series-marker="circle"/);
  assert.doesNotMatch(
    html,
    /data-chart-series-role="context" data-chart-series-marker="circle"/,
  );
});

test("places the selected-lap interaction hint immediately before each detail panel", () => {
  const html = renderChartTabs([rider("primary", "注目太郎", 1)], "gap");
  const hint =
    "グラフの点をクリックするか、周回セレクターで周回を固定すると、各選手の値を確認できます。ホバーは一時表示です。";

  assert.equal((html.match(/data-chart-interaction-hint/g) ?? []).length, 1);
  assert.equal((html.match(new RegExp(hint, "g")) ?? []).length, 1);
  assert.match(
    html,
    new RegExp(`data-chart-interaction-hint[^>]*>.*${hint}</p>.*data-chart-detail-panel="gap"`),
  );
});

test("uses the enlarged no-comparison frame", () => {
  const html = renderChartTabs([rider("primary", "注目太郎", 1)], "gap");

  assert.match(html, /h-72[^\"]*sm:h-\[22rem\][^\"]*lg:h-\[30rem\]/);
});

test("bounds an oversized all-mode key with a context aggregate", () => {
  const riders = Array.from({ length: 9 }, (_, index) =>
    rider(`rider-${index}`, `選手${index}`, index + 1),
  );
  const html = renderChartTabs(riders, "rank", true);

  assert.match(html, /参考選手・ほか8名（全9名）/);
  assert.doesNotMatch(html, /参考選手・選手8/);
});
