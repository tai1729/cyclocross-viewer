import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SummaryCard } from "../components/SummaryCard";
import type { RaceStory, RiderSummary } from "../lib/dataTransform";

const story: RaceStory = {
  highestRank: { lapNumber: 3, rank: 2 },
  maximumRankChange: { lapNumber: 4, positions: 2, direction: "gained" },
  narrative: "周囲との相対ペースを上げ、順位を3つ上げました。",
  available: true,
  paceTrend: "improved",
  netRankChange: 3,
  phaseNarratives: [
    "前半: 5位→3位、相対ペースを上げました。",
    "後半: 3位→2位、相対ペースはおおむね維持でした。",
  ],
};

const finishedSummary: RiderSummary = {
  result: {
    kind: "finished",
    position: 2,
    totalTimeSec: 600,
    gapToLeaderSec: 12,
    completedLapNumber: 5,
  },
  officialPositionLabel: null,
  totalRiders: 20,
  promotionZoneRank: 3,
  promotionGapSec: 0,
  isInPromotionZone: true,
};

test("summary card puts the race story beneath the existing result metrics", () => {
  const html = renderToStaticMarkup(
    createElement(SummaryCard, { summary: finishedSummary, raceStory: story }),
  );

  assert.match(html, /順位/);
  assert.match(html, /トップ差/);
  assert.match(html, /昇格圏/);
  assert.match(html, /レース展開/);
  assert.match(html, /前半: 5位→3位、相対ペースを上げました。/);
  assert.match(html, /後半: 3位→2位、相対ペースはおおむね維持でした。/);
  assert.match(html, /最高順位/);
  assert.match(html, /最大の順位変化/);
});

test("DNF summary keeps its status while also rendering its recorded race story", () => {
  const dnfSummary: RiderSummary = {
    ...finishedSummary,
    result: {
      kind: "dnf",
      completedLapNumber: 3,
      finalCheckpointRank: 5,
      gapToLeaderAtCheckpointSec: 18,
    },
  };
  const html = renderToStaticMarkup(
    createElement(SummaryCard, { summary: dnfSummary, raceStory: story }),
  );

  assert.match(html, /DNF/);
  assert.match(html, /離脱時点の差/);
  assert.match(html, /レース展開/);
});
