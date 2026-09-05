import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyRaceNavigation,
  getRaceNavigationOptions,
} from "../lib/raceNavigation";
import {
  parseRaceUrlState,
  serializeRaceUrlState,
  updateUrlQuery,
} from "../lib/urlState";

test("race navigation classifies scroll intent by transition", () => {
  assert.equal(classifyRaceNavigation("rider", true), "same-workspace");
  assert.equal(classifyRaceNavigation("rider", false), "navigation");
  assert.equal(classifyRaceNavigation("comparison"), "same-workspace");
  assert.equal(classifyRaceNavigation("metric"), "same-workspace");
  assert.equal(classifyRaceNavigation("lap"), "same-workspace");
  assert.equal(classifyRaceNavigation("category"), "navigation");
  assert.equal(classifyRaceNavigation("canonical"), "canonical");

  assert.deepEqual(getRaceNavigationOptions("rider", true), { scroll: false });
  assert.deepEqual(getRaceNavigationOptions("rider", false), { scroll: true });
  assert.deepEqual(getRaceNavigationOptions("category"), { scroll: true });
  assert.deepEqual(getRaceNavigationOptions("comparison"), { scroll: false });
  assert.deepEqual(getRaceNavigationOptions("metric"), { scroll: false });
  assert.deepEqual(getRaceNavigationOptions("lap"), { scroll: false });
  assert.deepEqual(getRaceNavigationOptions("canonical"), { scroll: false });
});

test("rider, metric, comparison, and lap updates round-trip through URL history", () => {
  const initial =
    "season=2025&series=A&category=cat-2&rider=r1&compare=pinned&fixed=r2&tab=lap&lap=3&unknown=one&unknown=two";
  const rider = updateUrlQuery(initial, { rider: "r3", fixed: ["r2"] });
  const metric = updateUrlQuery(rider, { tab: "pace", lap: 3 });
  const comparison = updateUrlQuery(metric, { compare: 2, fixed: [] });
  const lap = updateUrlQuery(comparison, { lap: null });

  const history = [initial, rider, metric, comparison, lap];
  assert.equal(parseRaceUrlState(history[1]).rider, "r3");
  assert.equal(parseRaceUrlState(history[2]).tab, "pace");
  assert.equal(parseRaceUrlState(history[3]).compare, 2);
  assert.equal(parseRaceUrlState(history[4]).lap, null);
  assert.deepEqual(
    history.map((query) => serializeRaceUrlState(parseRaceUrlState(query))),
    history,
  );
  assert.equal(parseRaceUrlState(history[1]).unknownParams.length, 2);
  assert.equal(parseRaceUrlState(history[4]).unknownParams[0]?.[1], "one");
});

test("category transition resets analysis state while preserving context and unknown pairs", () => {
  const current =
    "season=2025&series=A&category=cat-2&rider=r3&compare=pinned&fixed=r2&tab=pace&lap=3&x=first&x=second";
  const category = updateUrlQuery(current, {
    category: "cat-1",
    rider: "",
    compare: 2,
    fixed: [],
    tab: "rank",
    lap: null,
  });

  assert.equal(
    category,
    "season=2025&series=A&category=cat-1&x=first&x=second",
  );
  assert.deepEqual(parseRaceUrlState(category), {
    season: "2025",
    series: "A",
    category: "cat-1",
    rider: "",
    compare: 2,
    fixed: [],
    tab: "rank",
    lap: null,
    unknownParams: [["x", "first"], ["x", "second"]],
  });
});
