import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Disclosure } from "@/components/Disclosure";

function renderDisclosure(open?: boolean) {
  return renderToStaticMarkup(
    createElement(
      Disclosure,
      { summary: "詳細を表示", open },
      createElement("p", null, "内容"),
    ),
  );
}

test("shared disclosure exposes synchronized native disclosure semantics", () => {
  const closed = renderDisclosure(false);
  const open = renderDisclosure(true);

  assert.match(closed, /<details[^>]*>/);
  assert.match(closed, /<summary[^>]*aria-expanded="false"/);
  assert.match(open, /<details open=""[^>]*>/);
  assert.match(open, /<summary[^>]*aria-expanded="true"/);
  assert.match(closed, /lucide-chevron-down/);
  assert.match(open, /lucide-chevron-up/);

  const controls = closed.match(/aria-controls="([^"]+)"/)?.[1];
  assert.ok(controls);
  assert.match(closed, new RegExp(`<div id="${controls}"`));
  assert.match(closed, /min-h-11/);
  assert.match(closed, /focus-visible:ring-3/);
});

test("analysis disclosure surfaces use one shared component and remove internal result scrolling", async () => {
  const { readFile } = await import("node:fs/promises");
  const [chartDetail, results, viewer] = await Promise.all([
    readFile(new URL("../components/ChartDetailPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/RaceResultsTable.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/RaceViewer.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(chartDetail, /<Disclosure/);
  assert.doesNotMatch(chartDetail, /max-h-24|overflow-y-auto/);
  assert.doesNotMatch(results, /max-h-\[32rem\]|overflow-y-auto|analysisRegionId/);
  assert.doesNotMatch(results, /結果表を飛ばして分析操作へ/);
  assert.match(viewer, /<Disclosure/);
  assert.doesNotMatch(viewer, /analysisRegionId=/);
});
