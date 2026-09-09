import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildRiderSeriesStyles,
  CONTEXT_RIDER_COLORS,
  CONTEXT_RIDER_DASH_PATTERNS,
  CONTEXT_RIDER_MARKERS,
  CONTEXT_RIDER_STYLE,
  FIXED_RIDER_COLORS,
  FIXED_RIDER_DASH_PATTERNS,
  FIXED_RIDER_MARKERS,
  FIXED_RIDER_STYLE,
  PRIMARY_RIDER_STYLE,
} from "../lib/chartSeriesStyles";
import {
  RoleAwareTooltip,
  type RoleAwareTooltipProps,
} from "../components/RoleAwareTooltip";
import type { Rider } from "../lib/types";

function rider(riderId: string, finalPosition: number): Rider {
  return {
    riderId,
    name: riderId,
    finalPosition,
    status: "finished",
    laps: [],
    dataQuality: "ok",
  };
}

test("classifies primary, fixed, and context riders with their role styles", () => {
  const styles = buildRiderSeriesStyles(
    [rider("primary", 1), rider("fixed", 3), rider("context", 2)],
    "primary",
    ["fixed"],
  );

  assert.deepEqual(styles.primary, PRIMARY_RIDER_STYLE);
  assert.deepEqual(styles.fixed, {
    ...FIXED_RIDER_STYLE,
    color: FIXED_RIDER_COLORS[0],
    strokeDasharray: FIXED_RIDER_DASH_PATTERNS[0],
  });
  assert.deepEqual(styles.context, CONTEXT_RIDER_STYLE);
});

test("assigns fixed colors by active state order, not final position order", () => {
  const styles = buildRiderSeriesStyles(
    [rider("late", 1), rider("early", 2)],
    "late",
    ["early", "late"],
  );

  assert.equal(styles.early.color, FIXED_RIDER_COLORS[0]);
  assert.equal(styles.late.role, "primary");
});

test("filters invalid, duplicate, primary, and undisplayed fixed IDs", () => {
  const styles = buildRiderSeriesStyles(
    [rider("primary", 1), rider("shown", 2), rider("other", 3)],
    "primary",
    ["missing", "shown", "shown", "primary", "other", "missing"],
  );

  assert.deepEqual(Object.keys(styles), ["primary", "shown", "other"]);
  assert.equal(styles.shown.role, "fixed");
  assert.equal(styles.shown.color, FIXED_RIDER_COLORS[0]);
  assert.equal(styles.other.role, "fixed");
  assert.equal(styles.other.color, FIXED_RIDER_COLORS[1]);
});

test("returns only a primary style when the primary is the sole supplied rider", () => {
  const styles = buildRiderSeriesStyles(
    [rider("primary", 1)],
    "primary",
    ["other"],
  );

  assert.deepEqual(styles, { primary: PRIMARY_RIDER_STYLE });
});

test("does not create duplicate style keys for duplicate supplied riders", () => {
  const styles = buildRiderSeriesStyles(
    [rider("primary", 1), rider("fixed", 2), rider("fixed", 2)],
    "primary",
    ["fixed", "fixed"],
  );

  assert.deepEqual(Object.keys(styles), ["primary", "fixed"]);
  assert.equal(Object.keys(styles).length, new Set(Object.keys(styles)).size);
});

test("assigns deterministic distinct context colors by displayed order and cycles", () => {
  const contextRiders = Array.from({ length: CONTEXT_RIDER_COLORS.length + 1 }, (_, index) =>
    rider(`context-${index}`, index + 2),
  );
  const riders = [rider("primary", 1), ...contextRiders, rider("context-0", 99)];

  const first = buildRiderSeriesStyles(riders, "primary", []);
  const second = buildRiderSeriesStyles(riders, "primary", []);

  assert.equal(CONTEXT_RIDER_COLORS.length, 8);
  assert.equal(new Set(CONTEXT_RIDER_COLORS).size, CONTEXT_RIDER_COLORS.length);
  for (const [index, contextRider] of contextRiders.entries()) {
    assert.equal(
      first[contextRider.riderId].color,
      CONTEXT_RIDER_COLORS[index % CONTEXT_RIDER_COLORS.length],
    );
    assert.equal(first[contextRider.riderId].color, second[contextRider.riderId].color);
  }
  assert.deepEqual(first["context-0"], {
    ...CONTEXT_RIDER_STYLE,
    color: CONTEXT_RIDER_COLORS[0],
  });
  assert.equal(first["context-0"].color, CONTEXT_RIDER_COLORS[0]);
});

test("covers every supported fixed and context marker and dash assignment without cycling", () => {
  const fixedIds = Array.from({ length: 4 }, (_, index) => `fixed-${index}`);
  const contextIds = Array.from({ length: 10 }, (_, index) => `context-${index}`);
  const styles = buildRiderSeriesStyles(
    [
      rider("primary", 1),
      ...contextIds.map((riderId, index) => rider(riderId, index + 2)),
      ...fixedIds.map((riderId, index) => rider(riderId, index + 20)),
    ],
    "primary",
    ["fixed-3", "fixed-1", "fixed-0", "fixed-2"],
  );

  assert.equal(FIXED_RIDER_DASH_PATTERNS.length, 4);
  assert.equal(FIXED_RIDER_MARKERS.length, 4);
  assert.equal(CONTEXT_RIDER_DASH_PATTERNS.length, 10);
  assert.equal(CONTEXT_RIDER_MARKERS.length, 10);
  assert.equal(new Set(FIXED_RIDER_DASH_PATTERNS).size, 4);
  assert.equal(new Set(FIXED_RIDER_MARKERS).size, 4);
  assert.equal(new Set(CONTEXT_RIDER_DASH_PATTERNS).size, 10);
  assert.equal(new Set(CONTEXT_RIDER_MARKERS).size, 10);
  assert.equal((CONTEXT_RIDER_MARKERS as readonly string[]).includes("circle"), false);

  assert.deepEqual(
    ["fixed-3", "fixed-1", "fixed-0", "fixed-2"].map(
      (riderId) => styles[riderId].strokeDasharray,
    ),
    [...FIXED_RIDER_DASH_PATTERNS],
  );
  assert.deepEqual(
    ["fixed-3", "fixed-1", "fixed-0", "fixed-2"].map(
      (riderId) => styles[riderId].marker,
    ),
    [...FIXED_RIDER_MARKERS],
  );
  assert.deepEqual(
    contextIds.map((riderId) => styles[riderId].strokeDasharray),
    [...CONTEXT_RIDER_DASH_PATTERNS],
  );
  assert.deepEqual(
    contextIds.map((riderId) => styles[riderId].marker),
    [...CONTEXT_RIDER_MARKERS],
  );
  assert.equal(styles.primary.marker, "circle");
  assert.equal(styles.primary.strokeDasharray, undefined);
  assert.equal(
    new Set([styles.primary.marker, ...contextIds.map((riderId) => styles[riderId].marker)]).size,
    11,
  );
});

test("tooltip keeps aggregate context summary by default and exposes valid details when enabled", () => {
  const seriesStyles = {
    primary: PRIMARY_RIDER_STYLE,
    contextA: CONTEXT_RIDER_STYLE,
    contextB: { ...CONTEXT_RIDER_STYLE, color: CONTEXT_RIDER_COLORS[1] },
  };
  const baseProps = {
    active: true,
    label: 2,
    payload: [
      { dataKey: "primary", value: 0, graphicalItemId: "primary" },
      { dataKey: "contextA", value: 10, graphicalItemId: "contextA" },
      { dataKey: "contextB", value: 20, graphicalItemId: "contextB" },
      { dataKey: "contextB", value: Number.NaN, graphicalItemId: "contextB" },
    ],
    coordinate: undefined,
    accessibilityLayer: false,
    activeIndex: undefined,
    seriesStyles,
    riderNames: { primary: "Primary", contextA: "Rider A", contextB: "Rider B" },
    formatValue: (value: number) => `value:${value}`,
  } satisfies RoleAwareTooltipProps;

  const aggregateMarkup = renderToStaticMarkup(
    createElement(RoleAwareTooltip, baseProps),
  );
  const detailMarkup = renderToStaticMarkup(
    createElement(RoleAwareTooltip, { ...baseProps, showContextDetails: true }),
  );

  assert.match(aggregateMarkup, /value:10/);
  assert.match(aggregateMarkup, /value:20/);
  assert.doesNotMatch(aggregateMarkup, /Rider A|Rider B/);
  assert.match(detailMarkup, /Rider A/);
  assert.match(detailMarkup, /Rider B/);
  assert.match(detailMarkup, /value:10/);
  assert.match(detailMarkup, /value:20/);
  assert.doesNotMatch(detailMarkup, /NaN/);
});
