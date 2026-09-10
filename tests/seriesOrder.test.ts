import assert from "node:assert/strict";
import test from "node:test";
import { sortSeriesOptions } from "../lib/seriesOrder";

test("series options use the north-to-south order with 全日本 first", () => {
  const input = [
    "九州",
    "未知のシリーズ",
    "もみじ",
    "中国",
    "関東",
    "全日本",
    "関西",
    "四国",
    "東海",
    "山口",
    "東京",
    "富山",
    "信州",
    "宇都宮",
    "前橋",
    "野田",
    "千葉",
    "湘南",
    "東北",
  ];
  const original = [...input];

  assert.deepEqual(sortSeriesOptions(input), [
    "全日本",
    "東北",
    "関東",
    "宇都宮",
    "前橋",
    "野田",
    "千葉",
    "東京",
    "湘南",
    "富山",
    "信州",
    "東海",
    "関西",
    "中国",
    "もみじ",
    "山口",
    "四国",
    "九州",
    "未知のシリーズ",
  ]);
  assert.deepEqual(input, original);
});

test("unknown series are retained and ordered deterministically after known series", () => {
  assert.deepEqual(sortSeriesOptions(["Z", "A", "全日本", "A"]), ["全日本", "A", "A", "Z"]);
});
