import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LapDetailDisclosure } from "@/components/LapDetailDisclosure";
import { getMeasuredLapRows } from "@/lib/dataTransform";
import {
  getLapDetailDisclosureLabel,
  getResultsDisclosureLabel,
} from "@/lib/supportingPresentation";
import type { Rider } from "@/lib/types";

const rider: Rider = {
  riderId: "rider-1",
  name: "テスト選手",
  finalPosition: 1,
  status: "finished",
  laps: [
    {
      lapNumber: 1,
      lapTimeSec: 60,
      cumulativeTimeSec: 60,
      rankAtLap: 1,
    },
    {
      lapNumber: 2,
      lapTimeSec: 62,
      cumulativeTimeSec: 122,
      rankAtLap: 1,
    },
  ],
  dataQuality: "ok",
};

test("lap detail label includes the measured row count and rider name", () => {
  assert.equal(
    getLapDetailDisclosureLabel(rider),
    "ラップ詳細を表示・2周・テスト選手",
  );
});

test("lap detail label uses the explicit empty measured-lap copy", () => {
  assert.equal(
    getLapDetailDisclosureLabel({ ...rider, laps: [] }),
    "ラップ詳細を表示・有効な実測ラップなし",
  );
});

test("label count follows measured-row semantics, including duplicate invalidation", () => {
  const riderWithDuplicateLap: Rider = {
    ...rider,
    laps: [
      rider.laps[0],
      { ...rider.laps[0], rankAtLap: 2 },
      rider.laps[1],
    ],
  };

  assert.deepEqual(getMeasuredLapRows(riderWithDuplicateLap), []);
  assert.equal(
    getLapDetailDisclosureLabel(riderWithDuplicateLap),
    "ラップ詳細を表示・有効な実測ラップなし",
  );
});

test("lap detail disclosure is a controlled, closed native details surface", () => {
  const html = renderToStaticMarkup(
    createElement(LapDetailDisclosure, {
      primaryRider: rider,
      fixedRiders: [],
      open: false,
      onOpenChange: () => undefined,
    }),
  );

  assert.match(html, /<details[^>]*data-lap-detail-disclosure/);
  assert.doesNotMatch(html, /<details[^>]*\sopen(?:=|\s|>)/);
  assert.match(
    html,
    /<summary[^>]*min-h-11[^>]*focus-visible:ring-3[^>]*>.*ラップ詳細を表示・2周・テスト選手.*<\/summary>/,
  );
  assert.match(html, /LapDetailTable|ラップ詳細/);
});

test("results disclosure label exposes the full race rider count", () => {
  assert.equal(getResultsDisclosureLabel(98), "結果表を表示・98名");
});
