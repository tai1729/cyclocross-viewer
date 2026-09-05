import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRiderSeriesStyles,
  CONTEXT_RIDER_STYLE,
  FIXED_RIDER_COLORS,
  FIXED_RIDER_STYLE,
  PRIMARY_RIDER_STYLE,
} from "../lib/chartSeriesStyles";
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
