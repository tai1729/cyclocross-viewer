import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SeriesMarkerDot } from "../components/SeriesMarkerDot";
import type { RiderSeriesMarker } from "../lib/chartSeriesStyles";

const markers: RiderSeriesMarker[] = [
  "circle",
  "square",
  "diamond",
  "triangle",
  "plus",
  "ring",
  "cross",
  "star",
  "hexagon",
  "pentagon",
  "octagon",
];

const markerTags: Record<RiderSeriesMarker, string> = {
  circle: "circle",
  square: "rect",
  diamond: "polygon",
  triangle: "polygon",
  plus: "path",
  ring: "path",
  cross: "path",
  star: "polygon",
  hexagon: "polygon",
  pentagon: "polygon",
  octagon: "polygon",
};

test("returns no SVG for invalid coordinates", () => {
  for (const props of [
    { cx: undefined, cy: 20 },
    { cx: 10, cy: undefined },
    { cx: Number.NaN, cy: 20 },
    { cx: 10, cy: Number.POSITIVE_INFINITY },
  ]) {
    const html = renderToStaticMarkup(
      createElement(SeriesMarkerDot, { marker: "circle", ...props }),
    );

    assert.equal(html, "");
  }
});

test("renders every supported marker as SVG", () => {
  for (const marker of markers) {
    const html = renderToStaticMarkup(
      createElement(SeriesMarkerDot, { marker, cx: 10, cy: 20 }),
    );

    assert.notEqual(html, "", marker);
    assert.match(html, new RegExp(`<${markerTags[marker]}(?:\\s|>)`), marker);
  }
});

test("preserves visual props and marker size", () => {
  const html = renderToStaticMarkup(
    createElement(SeriesMarkerDot, {
      marker: "square",
      cx: 10,
      cy: 20,
      size: 7,
      r: 2,
      fill: "#123456",
      stroke: "#abcdef",
      strokeWidth: 2.5,
    }),
  );

  assert.match(html, /fill="#123456"/);
  assert.match(html, /stroke="#abcdef"/);
  assert.match(html, /stroke-width="2\.5"/);
  assert.match(html, /stroke-linejoin="round"/);
  assert.match(html, /x="3" y="13" width="14" height="14"/);
});
