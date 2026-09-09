import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MobileComparisonDisclosure } from "@/components/MobileComparisonDisclosure";
import type { Rider } from "@/lib/types";

const rider: Rider = {
  riderId: "rider-1",
  name: "テスト選手",
  finalPosition: 1,
  status: "finished",
  laps: [],
  dataQuality: "ok",
};

function renderDisclosure(
  overrides: Partial<React.ComponentProps<typeof MobileComparisonDisclosure>> = {},
) {
  return renderToStaticMarkup(
    createElement(MobileComparisonDisclosure, {
      mode: 2,
      displayedCount: 5,
      totalRiderCount: 5,
      riders: [rider],
      primaryRiderId: rider.riderId,
      pinnedRiderIds: [],
      onChange: () => undefined,
      onAdd: () => undefined,
      onRemove: () => undefined,
      ...overrides,
    }),
  );
}

test("mobile comparison uses a native closed disclosure with visible mode and count", () => {
  const html = renderDisclosure();

  assert.match(html, /<details[^>]*data-mobile-comparison-disclosure/);
  assert.match(html, /<summary[^>]*>.*比較する選手.*±2・現在5名.*<\/summary>/);
  assert.doesNotMatch(html, /比較する選手を追加/);
});

test("mobile comparison renders the pinned picker in its bounded panel", () => {
  const html = renderDisclosure({
    mode: "pinned",
    displayedCount: 1,
    pinnedCount: 0,
  });

  assert.match(html, /overscroll-contain/);
  assert.match(html, /max-h-\[min\(70dvh,32rem\)\]/);
  assert.match(html, /比較する選手を追加/);
});
