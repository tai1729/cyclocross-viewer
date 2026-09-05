import assert from "node:assert/strict";
import test from "node:test";
import { formatRaceUpdatedAt, getRaceSourceUrl } from "../lib/raceMetadata";

test("formats a UTC timestamp in JST without seconds", () => {
  assert.equal(formatRaceUpdatedAt("2024-01-01T00:30:00Z"), "2024/01/01 09:30 JST");
});

test("converts an offset timestamp to JST", () => {
  assert.equal(formatRaceUpdatedAt("2024-07-15T23:45:00-04:00"), "2024/07/16 12:45 JST");
});

test("returns an unknown label for empty or whitespace timestamps", () => {
  assert.equal(formatRaceUpdatedAt(""), "更新日時不明");
  assert.equal(formatRaceUpdatedAt(" \t\n "), "更新日時不明");
});

test("returns an unknown label for malformed, non-finite, or non-string values", () => {
  assert.equal(formatRaceUpdatedAt("not a date"), "更新日時不明");
  assert.equal(formatRaceUpdatedAt("2024-13-01T00:00:00Z"), "更新日時不明");
  assert.equal(formatRaceUpdatedAt(NaN), "更新日時不明");
  assert.equal(formatRaceUpdatedAt(null), "更新日時不明");
  assert.equal(formatRaceUpdatedAt(new Date("2024-01-01T00:00:00Z")), "更新日時不明");
});

test("builds a source URL with a trimmed, encoded path segment", () => {
  assert.equal(
    getRaceSourceUrl(" race/id_日本? & "),
    "https://github.com/tai1729/cyclocross-data-collector/blob/main/data/race-race%2Fid_%E6%97%A5%E6%9C%AC%3F%20%26.json",
  );
});

test("omits the source URL for blank or non-string race IDs", () => {
  assert.equal(getRaceSourceUrl(" \t\n "), null);
  assert.equal(getRaceSourceUrl(""), null);
  assert.equal(getRaceSourceUrl(123), null);
});
