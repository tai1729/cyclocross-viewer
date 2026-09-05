import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyResultsPresentation,
  getAnalysisPresentationOrder,
  getResultsDisclosureOpen,
} from "../lib/resultsPresentation";

test("mobile and browse states use the full results presentation", () => {
  assert.equal(classifyResultsPresentation(false, true), "full");
  assert.equal(classifyResultsPresentation(true, false), "full");
});

test("active Desktop uses a closed disclosure by default and honors user preference", () => {
  const presentation = classifyResultsPresentation(true, true);

  assert.equal(presentation, "desktop-disclosure");
  assert.equal(getResultsDisclosureOpen(presentation, false), false);
  assert.equal(getResultsDisclosureOpen(presentation, true), true);
});

test("mobile presentation does not turn the Desktop preference into an open state", () => {
  assert.equal(getResultsDisclosureOpen(classifyResultsPresentation(false, true), true), false);
});

test("analysis DOM order follows the mobile vertical and Desktop workspace contracts", () => {
  assert.deepEqual(getAnalysisPresentationOrder(false), {
    mainBeforeRail: false,
    chartTabsBeforeLapDetail: false,
  });
  assert.deepEqual(getAnalysisPresentationOrder(true), {
    mainBeforeRail: true,
    chartTabsBeforeLapDetail: true,
  });
});
