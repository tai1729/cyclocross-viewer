import assert from "node:assert/strict";
import test from "node:test";
import {
  CHART_READING_GUIDES,
  getChartReadingGuide,
} from "../lib/chartReadingGuide";

test("provides a typed guide for every chart tab", () => {
  assert.deepEqual(Object.keys(CHART_READING_GUIDES).sort(), [
    "gap",
    "lap",
    "pace",
    "rank",
  ]);
  for (const tab of ["rank", "gap", "pace", "lap"] as const) {
    assert.equal(getChartReadingGuide(tab), CHART_READING_GUIDES[tab]);
    assert.ok(getChartReadingGuide(tab).text.length > 0);
  }
});

test("explains rank direction and visual direction", () => {
  const guide = getChartReadingGuide("rank");

  assert.match(guide.text, /小さいほど/);
  assert.match(guide.text, /1位が最良/);
  assert.match(guide.text, /上にあるほど良い/);
  assert.match(guide.text, /実測順位を階段状/);
  assert.match(guide.text, /途中の順位を推定していません/);
});

test("explains cumulative gap sign relative to the selected rider", () => {
  const guide = getChartReadingGuide("gap");

  assert.match(guide.text, /注目選手/);
  assert.match(guide.text, /±0/);
  assert.match(guide.text, /プラスは比較選手が遅い・後ろ/);
  assert.match(guide.text, /マイナスは速い・前/);
});

test("explains pace as same-lap single-lap difference, not result-table lap deficit", () => {
  const guide = getChartReadingGuide("pace");

  assert.equal(guide.label, "周回差（単周タイム差）");
  assert.match(guide.text, /同じ周の単周タイム差/);
  assert.match(guide.text, /プラスは比較選手が遅い・後ろ/);
  assert.match(guide.text, /マイナスは速い・前/);
  assert.match(guide.text, /結果表の-1周（1周遅れ）とは別/);
});

test("explains lap-time direction and keeps the selected rider emphasized", () => {
  const guide = getChartReadingGuide("lap");

  assert.match(guide.text, /ラップタイムは小さいほど速い/);
  assert.match(guide.text, /下にあるほど速い/);
  assert.match(guide.text, /注目選手の線は強調/);
});
