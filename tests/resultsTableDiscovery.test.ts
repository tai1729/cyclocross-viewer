import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { matchesRiderSearch } from "../components/RaceResultsTable";
import { RaceResultsTable } from "../components/RaceResultsTable";
import type { RaceResult, Rider } from "../lib/types";

function sample(overrides: Partial<Rider> = {}): Rider {
  return {
    riderId: "ABC-123",
    name: "山田 太郎",
    finalPosition: 1,
    status: "finished",
    dataQuality: "ok",
    laps: [],
    ...overrides,
  };
}

test("result-table rider filter matches normalized names and IDs without changing empty-query rows", () => {
  const rider = sample();

  assert.equal(matchesRiderSearch(rider, ""), true);
  assert.equal(matchesRiderSearch(rider, "  山田　太郎 "), true);
  assert.equal(matchesRiderSearch(rider, "abc-123"), true);
  assert.equal(matchesRiderSearch(rider, "別の選手"), false);
});

test("annotated rank keeps the official label in the result table without status reinterpretation", () => {
  const lap = {
    lapNumber: 1,
    lapTimeSec: 60,
    cumulativeTimeSec: 60,
    rankAtLap: 1,
  };
  const race: RaceResult = {
    raceId: "race-1",
    raceName: "Race",
    category: "Category",
    updatedAt: "2026-09-14",
    riders: [
      sample({ riderId: "leader", name: "Leader", finalPosition: 1, laps: [lap] }),
      sample({
        riderId: "annotated",
        name: "A Very Long Rider Name For Narrow Screens",
        finalPosition: 2,
        status: "annotated-rank",
        officialPositionLabel: "15 (LapOut)",
        laps: [{ ...lap, cumulativeTimeSec: 61, rankAtLap: 2 }],
      }),
    ],
  };
  const html = renderToStaticMarkup(
    createElement(RaceResultsTable, {
      race,
      selectedRiderId: null,
      onSelect: () => undefined,
    }),
  );

  assert.equal((html.match(/15 \(LapOut\)/g) ?? []).length, 2);
  assert.match(html, /w-\[4rem\]/);
  assert.match(html, /w-\[3\.25rem\]/);
  assert.match(html, /w-\[3\.75rem\]/);
  assert.match(html, /A Very Long Rider Name For Narrow Screens/);
  assert.doesNotMatch(html, /truncate/);
  const annotatedNameIndex = html.indexOf("A Very Long Rider Name For Narrow Screens");
  const annotatedRowStart = html.lastIndexOf("<tr", annotatedNameIndex);
  const annotatedRowEnd = html.indexOf("</tr>", annotatedNameIndex);
  assert.ok(annotatedRowStart >= 0 && annotatedRowEnd > annotatedRowStart);
  const annotatedRow = html.slice(annotatedRowStart, annotatedRowEnd);
  assert.doesNotMatch(annotatedRow, />完走</);
  assert.doesNotMatch(annotatedRow, />DNF</);
});

test("result table shows source-style rank percentages and omits them for DNF", () => {
  const lap = {
    lapNumber: 1,
    lapTimeSec: 60,
    cumulativeTimeSec: 60,
    rankAtLap: 1,
  };
  const race: RaceResult = {
    raceId: "race-1",
    raceName: "Race",
    category: "Category",
    updatedAt: "2026-09-14",
    riders: [
      sample({ riderId: "leader", finalPosition: 1, laps: [lap] }),
      sample({ riderId: "second", finalPosition: 2, laps: [] }),
      sample({
        riderId: "cutoff",
        finalPosition: 3,
        status: "annotated-rank",
        officialPositionLabel: "3 (80%Out)",
        laps: [{ ...lap, cumulativeTimeSec: 61, rankAtLap: 2 }],
      }),
      sample({
        riderId: "dnf",
        name: "DNF Rider",
        finalPosition: 4,
        status: "dnf",
        laps: [],
      }),
    ],
  };
  const html = renderToStaticMarkup(
    createElement(RaceResultsTable, {
      race,
      selectedRiderId: null,
      onSelect: () => undefined,
    }),
  );

  assert.match(html, /<th[^>]*>\s*順位\s*<\/th>/);
  assert.match(html, /<th[^>]*>\s*順位%\s*<\/th>/);
  assert.match(html, />25%</);
  assert.match(html, />75%</);
  const dnfNameIndex = html.indexOf("DNF Rider");
  const dnfRowStart = html.lastIndexOf("<tr", dnfNameIndex);
  const dnfRowEnd = html.indexOf("</tr>", dnfNameIndex);
  assert.ok(dnfRowStart >= 0 && dnfRowEnd > dnfRowStart);
  assert.doesNotMatch(html.slice(dnfRowStart, dnfRowEnd), /%/);
});
