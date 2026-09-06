import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";
import { RiderSelector } from "@/components/RiderSelector";
import type { Rider } from "@/lib/types";

const rider: Rider = {
  riderId: "rider-1",
  name: "Test Rider",
  finalPosition: 1,
  status: "finished",
  laps: [],
  dataQuality: "ok",
};

const addableRider: Rider = {
  ...rider,
  riderId: "rider-2",
  name: "Addable Rider",
};

function renderComparison(presentation?: "desktop" | "mobile") {
  return renderToStaticMarkup(
    createElement(ComparisonAdjuster, {
      mode: 2,
      displayedCount: 3,
      totalRiderCount: 3,
      onChange: () => undefined,
      presentation,
    }),
  );
}

function renderRiderSelector(presentation?: "inline" | "mobile-modal") {
  return renderToStaticMarkup(
    createElement(RiderSelector, {
      riders: [rider],
      categoryName: "Test Category",
      selectedRiderId: rider.riderId,
      onSelect: () => undefined,
      presentation,
    }),
  );
}

function renderComparisonRiderPicker() {
  return renderToStaticMarkup(
    createElement(ComparisonRiderPicker, {
      riders: [rider, addableRider],
      primaryRiderId: null,
      pinnedRiderIds: [rider.riderId],
      onAdd: () => undefined,
      onRemove: () => undefined,
    }),
  );
}

test("mobile comparison controls retain 44px classes while desktop keeps compact classes", () => {
  const mobileHtml = renderComparison("mobile");
  const desktopHtml = renderComparison();

  assert.match(mobileHtml, /min-h-11 min-w-11/);
  assert.doesNotMatch(mobileHtml, /sm:min-h-7 sm:min-w-7/);
  assert.match(desktopHtml, /sm:min-h-7 sm:min-w-7/);
});

test("mobile-modal rider controls retain 44px classes while inline controls keep compact classes", () => {
  const mobileHtml = renderRiderSelector("mobile-modal");
  const inlineHtml = renderRiderSelector();

  assert.match(mobileHtml, /size-11/);
  assert.doesNotMatch(mobileHtml, /sm:size-8/);
  assert.match(inlineHtml, /sm:size-8/);
  assert.match(inlineHtml, /sm:min-h-8/);
});

test("comparison rider picker keeps mobile touch targets through tablet widths", () => {
  const html = renderComparisonRiderPicker();

  assert.match(html, /min-h-11 w-full lg:min-h-8/);
  assert.equal(
    (html.match(/min-h-11 shrink-0 lg:min-h-8/g) ?? []).length,
    2,
  );
  assert.doesNotMatch(html, /sm:min-h-8/);
});
