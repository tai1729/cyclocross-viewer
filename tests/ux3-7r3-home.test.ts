import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meetSelectorSource = readFileSync(new URL("../components/MeetSelector.tsx", import.meta.url), "utf8");
const riderDiscoverySource = readFileSync(new URL("../components/RiderDiscovery.tsx", import.meta.url), "utf8");

test("home filter navigation preserves scroll position and season/series independence", () => {
  assert.match(meetSelectorSource, /router\.replace\(canonicalQuery \? `\/\?\$\{canonicalQuery\}` : "\/", \{ scroll: false \}\)/);
  assert.match(meetSelectorSource, /router\.push\(nextQuery \? `\/\?\$\{nextQuery\}` : "\/", \{ scroll: false \}\)/);
  assert.match(meetSelectorSource, /season: patch\.season \?\? season,\s*series: patch\.series \?\? series/);
  assert.match(meetSelectorSource, /function changeSeason\(value: string\) \{\s*pushUrl\(\{ season: value \}\);\s*\}/);
  assert.doesNotMatch(meetSelectorSource, /function changeSeason[\s\S]*?series:\s*""/);
  assert.doesNotMatch(meetSelectorSource, /window\.scrollTo/);
});

test("rider discovery controls share a responsive aligned row", () => {
  const formStart = riderDiscoverySource.indexOf("<form ");
  const formEnd = riderDiscoverySource.indexOf("</form>", formStart);
  assert.notEqual(formStart, -1);
  assert.notEqual(formEnd, -1);
  const formSource = riderDiscoverySource.slice(formStart, formEnd);

  assert.match(formSource, /sm:items-start/);
  assert.match(formSource, /sm:flex-row sm:items-center/);
  assert.match(formSource, /<input[\s\S]*className="min-h-11[^\"]*"/);
  assert.match(formSource, /<Button type="submit"[\s\S]*className="min-h-11[^\"]*"/);
  assert.doesNotMatch(formSource, /sm:items-end/);
});
