import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import FeedbackPage from "../app/feedback/page";
import { getFeedbackCategoryOptions } from "../lib/feedback/feedbackSchema";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("feedback page renders the app context, return method, labels, and privacy disclosure", () => {
  const html = renderToStaticMarkup(createElement(FeedbackPage));

  assert.match(html, /AJOCCラップタイムビューア/);
  assert.match(html, /ご意見・不具合を送る/);
  assert.match(html, /どんな内容ですか？/);
  assert.match(html, /内容を教えてください。/);
  assert.match(html, /返信が必要な場合の連絡先（任意）/);
  assert.match(html, /匿名で送信できます/);
  assert.match(html, /表示中の画面状態/);
  assert.match(html, /Cookie/);
  assert.match(html, /広告ID/);
  assert.match(html, /スクリーンショット/);

  for (const option of getFeedbackCategoryOptions()) assert.match(html, new RegExp(option.label));
  assert.match(html, /name="website"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /tabindex="-1"/);
});

test("feedback UI source preserves responsive placement and route contract", () => {
  const entry = read("components/feedback/FeedbackEntry.tsx");
  const form = read("components/feedback/FeedbackForm.tsx");
  const layout = read("app/layout.tsx");

  assert.match(entry, /fixed right-4 bottom-\[calc\(1rem\+env\(safe-area-inset-bottom\)\)\]/);
  assert.match(entry, /hidden min-h-10 .*lg:inline-flex/);
  assert.match(entry, /<footer className="mt-auto .*pb-\[calc\(1rem\+env\(safe-area-inset-bottom\)\)\] lg:hidden/);
  assert.doesNotMatch(entry, /sticky/);
  assert.match(layout, /pb-16/);
  assert.match(entry, /FEEDBACK_SNAPSHOT_STORAGE_KEY/);
  assert.match(entry, /snapshotFeedbackContext\(buildFeedbackContext\(\)\)/);
  assert.match(entry, /getFeedbackReturnPath\(window\.location\)/);
  assert.match(form, /fetch\("\/api\/feedback"/);
  assert.match(form, /"Idempotency-Key": idempotencyKey/);
  assert.match(form, /const websiteRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(form, /website: websiteRef\.current\?\.value \?\? ""/);
  assert.match(form, /<input ref=\{websiteRef\} id="feedback-website" name="website" tabIndex=\{-1\} aria-hidden="true" autoComplete="off" defaultValue="" \/>/);
  assert.doesNotMatch(form, /website: ""/);
  assert.match(form, /送信中…/);
  assert.match(form, /ご意見・不具合を送信しました。ご協力ありがとうございます。/);
  assert.match(form, /送信できませんでした。入力内容を確認して、もう一度お試しください。/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /aria-describedby/);
});
