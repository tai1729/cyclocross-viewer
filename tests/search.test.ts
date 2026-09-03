import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSearchText } from "../lib/search";

test("氏名の半角・全角空白を除去する", () => {
  assert.equal(normalizeSearchText("横山 航太"), "横山航太");
  assert.equal(normalizeSearchText("横山　航太"), "横山航太");
});

test("全角英数をNFKCで揃え、英字の大小文字を区別しない", () => {
  assert.equal(normalizeSearchText("ＴＡＩ Rider"), "tairider");
  assert.equal(normalizeSearchText("taiRIDER"), "tairider");
});
