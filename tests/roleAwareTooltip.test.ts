import assert from "node:assert/strict";
import test from "node:test";
import {
  formatLapTooltipLabel,
  getTooltipRankAtLap,
} from "@/components/RoleAwareTooltip";

test("tooltip rank lookup uses the hovered lap and omits missing or invalid ranks", () => {
  const lapMap = new Map([
    [3, { rankAtLap: 7 }],
    [4, { rankAtLap: Number.NaN }],
  ]);

  assert.equal(getTooltipRankAtLap(3, lapMap), 7);
  assert.equal(getTooltipRankAtLap("3", lapMap), 7);
  assert.equal(getTooltipRankAtLap(4, lapMap), null);
  assert.equal(getTooltipRankAtLap(5, lapMap), null);
  assert.equal(getTooltipRankAtLap("not-a-lap", lapMap), null);
  assert.equal(getTooltipRankAtLap(3), null);
});

test("tooltip lap labels retain the existing Japanese lap suffix", () => {
  assert.equal(formatLapTooltipLabel(3), "3周目");
  assert.equal(formatLapTooltipLabel("4"), "4周目");
});
