import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  serializeHomeUrlState,
  updateUrlQuery,
} from "../lib/urlState";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("sticky list context preserves season/series and direct races fall back to the list", () => {
  const contextQuery = serializeHomeUrlState({
    season: "2025",
    series: "A",
    unknownParams: [],
  });

  assert.equal(`/?${contextQuery}`, "/?season=2025&series=A");
  assert.equal(serializeHomeUrlState({ season: "", series: "", unknownParams: [] }), "");

  const viewer = read("components/RaceViewer.tsx");
  assert.match(
    viewer,
    /export function getRaceListHref[\s\S]*return returnContextQuery \? `\/\?\$\{returnContextQuery\}` : "\/";/,
  );
  assert.match(
    viewer,
    /\(!urlState\.season \|\| urlState\.season === meet\.season\)[\s\S]*\(!urlState\.series \|\| urlState\.series === meet\.series\)/,
  );
});

test("category navigation keeps the existing rider/comparison/tab/lap reset", () => {
  const nextQuery = updateUrlQuery(
    "season=2025&series=A&category=cat-2&rider=r1&compare=pinned&fixed=r2&tab=pace&lap=3",
    {
      category: "cat-1",
      rider: "",
      compare: 2,
      fixed: [],
      tab: "rank",
      lap: null,
    },
  );

  assert.equal(nextQuery, "season=2025&series=A&category=cat-1");
});

test("RaceHeader owns the single sticky context navigation layer", () => {
  const header = read("components/RaceHeader.tsx");
  const viewer = read("components/RaceViewer.tsx");

  assert.match(header, /data-race-header/);
  assert.match(header, /className="sticky top-0/);
  assert.match(header, /<Link[\s\S]*href=\{listHref\}/);
  assert.match(header, /data-race-header-category/);
  assert.match(viewer, /<RaceHeader[\s\S]*listHref=\{listHref\}[\s\S]*categorySelector=/);
  assert.match(viewer, /data-race-category-trigger/);
  assert.match(viewer, /scroll-mt-56[\s\S]*sm:scroll-mt-40[\s\S]*lg:scroll-mt-32/);
  assert.doesNotMatch(viewer, /<div className="flex items-start justify-between gap-3 text-sm">/);
  assert.doesNotMatch(viewer, /<Field className="gap-1">[\s\S]*<RaceHeader/);
});

test("Results reveal scrolls both disclosures clear of the narrow sticky header", () => {
  const viewer = read("components/RaceViewer.tsx");

  assert.equal(
    (viewer.match(/className="min-w-0 scroll-mt-28 sm:scroll-mt-24"/g) ?? []).length,
    2,
  );
  assert.match(
    viewer,
    /resultsElement\.scrollIntoView\(\{ block: "start", behavior: "smooth" \}\)/,
  );
  assert.match(
    viewer,
    /function openResultsDisclosure\(\)[\s\S]*setDesktopResultsOpen\(true\);[\s\S]*setMobileResultsOpen\(true\)/,
  );
});
