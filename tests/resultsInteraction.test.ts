import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getResultsSelectionNavigationDecision,
  getSupportingDisclosureLifecycleDecision,
  isResultsRiderSelectionNavigation,
  shouldRevealAnalysisRegion,
} from "../lib/resultsInteraction";
import {
  classifyResultsPresentation,
  getResultsDisclosureOpen,
} from "../lib/resultsPresentation";

test("only an active Results selection of another rider is navigation", () => {
  assert.equal(isResultsRiderSelectionNavigation("rider-1", "rider-2"), true);
  assert.equal(isResultsRiderSelectionNavigation("rider-1", "rider-1"), false);
  assert.equal(isResultsRiderSelectionNavigation(null, "rider-1"), false);
});

test("pending Results navigation is consumable only after the URL changes to its target", () => {
  assert.deepEqual(
    getResultsSelectionNavigationDecision({
      pendingRiderId: "rider-2",
      currentUrlRiderId: "rider-1",
      queryChanged: false,
      isPopstate: false,
    }),
    { canConsumePending: false, shouldClearPending: false },
  );
  assert.deepEqual(
    getResultsSelectionNavigationDecision({
      pendingRiderId: "rider-2",
      currentUrlRiderId: "rider-2",
      queryChanged: true,
      isPopstate: false,
    }),
    { canConsumePending: true, shouldClearPending: false },
  );
});

test("a different URL or popstate clears stale Results navigation", () => {
  assert.deepEqual(
    getResultsSelectionNavigationDecision({
      pendingRiderId: "rider-2",
      currentUrlRiderId: "rider-3",
      queryChanged: true,
      isPopstate: false,
    }),
    { canConsumePending: false, shouldClearPending: true },
  );
  assert.deepEqual(
    getResultsSelectionNavigationDecision({
      pendingRiderId: "rider-2",
      currentUrlRiderId: "rider-1",
      queryChanged: false,
      isPopstate: true,
    }),
    { canConsumePending: false, shouldClearPending: true },
  );
});

test("analysis reveal occurs only when the region is completely outside the viewport", () => {
  assert.equal(shouldRevealAnalysisRegion({ top: 900, bottom: 1200 }, 900), true);
  assert.equal(shouldRevealAnalysisRegion({ top: -300, bottom: 0 }, 900), true);
  assert.equal(shouldRevealAnalysisRegion({ top: 899, bottom: 1200 }, 900), false);
  assert.equal(shouldRevealAnalysisRegion({ top: -300, bottom: 1 }, 900), false);
});

test("supporting disclosures reset for lifecycle boundaries and preserve same-workspace changes", () => {
  const sameWorkspace = {
    isLoading: false,
    hasError: false,
    hasRace: true,
    isAnalyzing: true,
    wasAnalyzing: true,
  };

  assert.equal(getSupportingDisclosureLifecycleDecision(sameWorkspace), "preserve");
  assert.equal(
    getSupportingDisclosureLifecycleDecision({ ...sameWorkspace, isLoading: true }),
    "reset",
  );
  assert.equal(
    getSupportingDisclosureLifecycleDecision({ ...sameWorkspace, hasError: true }),
    "reset",
  );
  assert.equal(
    getSupportingDisclosureLifecycleDecision({ ...sameWorkspace, hasRace: false }),
    "reset",
  );
  assert.equal(
    getSupportingDisclosureLifecycleDecision({ ...sameWorkspace, isAnalyzing: false }),
    "reset",
  );
  assert.equal(
    getSupportingDisclosureLifecycleDecision({ ...sameWorkspace, wasAnalyzing: false }),
    "reset",
  );
});

test("Desktop and Mobile active Results share the handler while keeping presentation preferences separate", () => {
  const source = readFileSync(new URL("../components/RaceViewer.tsx", import.meta.url), "utf8");

  assert.match(source, /const resultsTable = \(/);
  assert.equal((source.match(/onSelect=\{selectRiderFromResults\}/g) ?? []).length, 1);
  assert.match(source, /getResultsDisclosureOpen\(resultsPresentation, desktopResultsOpen\)/);
  assert.match(source, /getResultsDisclosureOpen\(resultsPresentation, mobileResultsOpen\)/);
  assert.equal(getResultsDisclosureOpen(classifyResultsPresentation(true, true), false), false);
  assert.equal(getResultsDisclosureOpen(classifyResultsPresentation(false, true), true), true);
});
