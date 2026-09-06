import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFeedbackContext,
  buildFeedbackContextFromLocation,
  getFeedbackReturnPath,
  normalizeBrowserFamily,
  snapshotFeedbackContext,
} from "../lib/feedback/context";

test("builds allowlisted race context from the known URL state", () => {
  const result = buildFeedbackContextFromLocation(
    "/race/meet-123?season=2025&series=A&category=cat-1&rider=r-1&compare=pinned&fixed=r-2&fixed=r-2&fixed=r-3&tab=lap&lap=12#ignored",
    {
      viewportWidth: 390,
      viewportHeight: 844,
      userAgent: "Mozilla/5.0 Version/17.0 Mobile/15E148 Safari/604.1",
      appVersion: "test-build",
    },
  );

  assert.deepEqual(result, {
    route: "race",
    meetId: "meet-123",
    raceId: "cat-1",
    categoryId: "cat-1",
    riderId: "r-1",
    fixedRiderIds: ["r-2", "r-3"],
    metric: "lap",
    comparisonMode: "pinned",
    lap: 12,
    season: "2025",
    series: "A",
    viewportWidth: 390,
    viewportHeight: 844,
    browserFamily: "safari",
    appVersion: "test-build",
  });
});

test("drops unknown queries, fragments, display names, raw UA, and cookies", () => {
  const result = buildFeedbackContext({
    location: "https://example.test/race/meet-1?unknown=secret&riderName=Alice&fixed=valid&compare=2#cookie=secret",
    viewportWidth: 320,
    viewportHeight: 568,
    userAgent: "Raw UA should not be emitted",
  });

  assert.deepEqual(result, {
    route: "race",
    meetId: "meet-1",
    comparisonMode: 2,
    viewportWidth: 320,
    viewportHeight: 568,
    browserFamily: "other",
    appVersion: "0.1.0",
  });
  assert.equal(JSON.stringify(result).includes("unknown"), false);
  assert.equal(JSON.stringify(result).includes("Raw UA"), false);
  assert.equal(JSON.stringify(result).includes("cookie"), false);
});

test("drops malformed optional URL fields and only keeps fixed IDs for pinned mode", () => {
  const result = buildFeedbackContextFromLocation(
    "/race/meet%20bad?category=bad%20category&rider=bad%20rider&compare=invalid&fixed=a&fixed=a&fixed=b&fixed=c&fixed=d&fixed=e&tab=invalid&lap=0",
    { viewport: { width: 20000, height: 1 }, userAgent: "" },
  );
  assert.deepEqual(result, {
    route: "race",
    viewportWidth: 10000,
    viewportHeight: 240,
    browserFamily: "unknown",
    appVersion: "0.1.0",
  });
});

test("normalizes browser family with Edge precedence and iOS Safari support", () => {
  assert.equal(normalizeBrowserFamily(""), "unknown");
  assert.equal(normalizeBrowserFamily("Mozilla/5.0 Edg/120.0 Chrome/120.0 Safari/537.36"), "edge");
  assert.equal(normalizeBrowserFamily("Mozilla/5.0 Firefox/122.0"), "firefox");
  assert.equal(normalizeBrowserFamily("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1"), "safari");
  assert.equal(normalizeBrowserFamily("Mozilla/5.0 CriOS/120.0 Mobile/15E148 Safari/604.1"), "chromium");
  assert.equal(normalizeBrowserFamily("some-unrecognized-agent"), "other");
});

test("snapshot clones mutable fixed-rider state and returns a safe return path", () => {
  const original = buildFeedbackContext("/race/meet-1?compare=pinned&fixed=r-1", { viewportWidth: 390, viewportHeight: 844 });
  const copy = snapshotFeedbackContext(original);
  assert.notEqual(copy, original);
  assert.deepEqual(copy.fixedRiderIds, ["r-1"]);
  assert.equal(getFeedbackReturnPath("/race/meet-1?category=cat-1&rider=r-1&secret=x#ignored"), "/race/meet-1?category=cat-1&rider=r-1");
});
