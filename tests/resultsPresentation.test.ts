import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyResultsPresentation,
  getAnalysisPresentationOrder,
  getResultsDisclosureOpen,
} from "../lib/resultsPresentation";

test("browse stays full while active Mobile uses its own disclosure presentation", () => {
  assert.equal(classifyResultsPresentation(false, false), "full");
  assert.equal(classifyResultsPresentation(false, true), "mobile-disclosure");
  assert.equal(classifyResultsPresentation(true, false), "full");
});

test("active Desktop uses a closed disclosure by default and honors user preference", () => {
  const presentation = classifyResultsPresentation(true, true);

  assert.equal(presentation, "desktop-disclosure");
  assert.equal(getResultsDisclosureOpen(presentation, false), false);
  assert.equal(getResultsDisclosureOpen(presentation, true), true);
});

test("Desktop and Mobile disclosure preferences remain independent", () => {
  const desktopPresentation = classifyResultsPresentation(true, true);
  const mobilePresentation = classifyResultsPresentation(false, true);
  const desktopPreference = false;
  const mobilePreference = true;

  assert.equal(getResultsDisclosureOpen(desktopPresentation, desktopPreference), false);
  assert.equal(getResultsDisclosureOpen(mobilePresentation, false), false);
  assert.equal(getResultsDisclosureOpen(mobilePresentation, mobilePreference), true);
  assert.equal(getResultsDisclosureOpen(mobilePresentation, desktopPreference), false);
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
