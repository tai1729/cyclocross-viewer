import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";
import {
  closeRiderSelector,
  isRiderSelectorCloseKey,
  RiderSelector,
} from "@/components/RiderSelector";
import { SummaryCard } from "@/components/SummaryCard";
import { getRiderSummary } from "@/lib/dataTransform";
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

function renderOpenRiderSelector() {
  return renderToStaticMarkup(
    createElement(RiderSelector, {
      riders: [rider],
      categoryName: "Test Category",
      selectedRiderId: null,
      onSelect: () => undefined,
      presentation: "inline",
    }),
  );
}

const annotatedRider: Rider = {
  ...rider,
  riderId: "annotated-rider",
  name: "A Very Long Annotated Rider Name For Narrow Screens",
  status: "annotated-rank",
  officialPositionLabel: "15 (LapOut)",
  finalPosition: 2,
};

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
  assert.match(mobileHtml, /比較する選手/);
  assert.doesNotMatch(mobileHtml, /sm:min-h-7 sm:min-w-7/);
  assert.match(desktopHtml, /sm:min-h-7 sm:min-w-7/);
});

test("rider selector arrows retain 44px controls in both presentations", () => {
  const mobileHtml = renderRiderSelector("mobile-modal");
  const inlineHtml = renderRiderSelector();

  assert.match(mobileHtml, /size-11/);
  assert.doesNotMatch(mobileHtml, /sm:size-8/);
  assert.match(inlineHtml, /size-11/);
  assert.doesNotMatch(inlineHtml, /sm:size-8/);
  assert.doesNotMatch(inlineHtml, /sm:min-h-8/);
  assert.match(inlineHtml, /注目選手/);
});

test("rider selector links the desktop trigger and list with expanded state", () => {
  const closedHtml = renderRiderSelector("inline");
  const openHtml = renderOpenRiderSelector();

  assert.match(closedHtml, /data-race-rider-trigger[^>]*aria-expanded="false"/);
  assert.match(closedHtml, /aria-controls="rider-list-[^"]+"/);
  assert.match(openHtml, /id="rider-list-[^"]+"/);
  assert.doesNotMatch(closedHtml, /data-race-rider-close/);
});

test("mobile rider selector keeps dialog presentation without desktop close controls", () => {
  const mobileHtml = renderRiderSelector("mobile-modal");

  assert.doesNotMatch(mobileHtml, /data-race-rider-close/);
  assert.doesNotMatch(mobileHtml, /aria-controls="rider-list-/);
});

test("rider selector close interactions reset search and restore focus for pointer and keyboard paths", () => {
  const closeReasons = ["pointer", "Enter", " ", "Escape"] as const;

  for (const reason of closeReasons) {
    if (reason !== "pointer") {
      assert.equal(isRiderSelectorCloseKey(reason), true);
    }

    let query = "selected rider";
    let shouldFocusSearch = true;
    let isOpen = true;
    let focusRestored = false;
    closeRiderSelector({
      setQuery: (value) => {
        query = value;
      },
      setShouldFocusSearch: (value) => {
        shouldFocusSearch = value;
      },
      setIsOpen: (value) => {
        isOpen = value;
      },
      restoreFocus: () => {
        focusRestored = true;
      },
    });

    assert.equal(query, "");
    assert.equal(shouldFocusSearch, false);
    assert.equal(isOpen, false);
    assert.equal(focusRestored, true);
  }
});

test("desktop and mobile rider selectors expose the annotated official rank label", () => {
  const render = (presentation: "inline" | "mobile-modal") =>
    renderToStaticMarkup(
      createElement(RiderSelector, {
        riders: [annotatedRider],
        categoryName: "Test Category",
        selectedRiderId: annotatedRider.riderId,
        onSelect: () => undefined,
        presentation,
      }),
    );

  const desktopHtml = render("inline");
  const mobileHtml = render("mobile-modal");
  assert.match(desktopHtml, /15 \(LapOut\)/);
  assert.match(desktopHtml, /注目選手を変更: 15 \(LapOut\) A Very Long Annotated Rider Name For Narrow Screens/);
  assert.match(mobileHtml, /15 \(LapOut\)/);
  assert.match(mobileHtml, /15 \(LapOut\) A Very Long Annotated Rider Name For Narrow Screens/);
  assert.match(desktopHtml, /break-words/);
  assert.match(mobileHtml, /break-words/);
  assert.match(desktopHtml, /flex min-w-0 flex-wrap[^\"]*break-words/);
  assert.match(mobileHtml, /min-w-0 max-w-full break-words font-mono/);
  assert.doesNotMatch(desktopHtml, /w-8 shrink-0/);
  assert.doesNotMatch(mobileHtml, /w-8 shrink-0/);
  assert.doesNotMatch(desktopHtml, /truncate/);
  assert.doesNotMatch(mobileHtml, /truncate/);
  assert.doesNotMatch(desktopHtml, />DNF</);
  assert.doesNotMatch(mobileHtml, />DNF</);
});

test("annotated summary renders the official label as an independent display field", () => {
  const lap = { lapNumber: 1, lapTimeSec: 60, cumulativeTimeSec: 60, rankAtLap: 1 };
  const summary = getRiderSummary(
    {
      raceId: "race-1",
      raceName: "Race",
      category: "Category",
      updatedAt: "2026-09-14",
      riders: [
        { ...rider, laps: [lap] },
        {
          ...annotatedRider,
          laps: [{ ...lap, cumulativeTimeSec: 61, rankAtLap: 2 }],
        },
      ],
    },
    annotatedRider.riderId,
  );
  assert.ok(summary);
  const html = renderToStaticMarkup(createElement(SummaryCard, { summary }));
  assert.match(html, /data-official-position-label/);
  assert.match(html, /公式表記/);
  assert.match(html, /15 \(LapOut\)/);
  assert.doesNotMatch(html, /公式注記/);
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
