import assert from "node:assert/strict";
import test from "node:test";
import { formatLapTooltipLabel } from "@/components/RoleAwareTooltip";

test("tooltip lap labels retain the existing Japanese lap suffix", () => {
  assert.equal(formatLapTooltipLabel(3), "3周目");
  assert.equal(formatLapTooltipLabel("4"), "4周目");
});
