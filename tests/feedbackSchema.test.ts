import assert from "node:assert/strict";
import test from "node:test";
import {
  getFeedbackCategoryLabel,
  getFeedbackCategoryOptions,
  isValidFeedbackSubmission,
  validateFeedbackSubmission,
  type FeedbackContext,
  type FeedbackSubmission,
} from "../lib/feedback/feedbackSchema";

function context(overrides: Partial<FeedbackContext> = {}): FeedbackContext {
  return {
    route: "race",
    meetId: "meet-1",
    raceId: "race-1",
    categoryId: "race-1",
    viewportWidth: 390,
    viewportHeight: 844,
    browserFamily: "safari",
    appVersion: "0.1.0",
    ...overrides,
  };
}

function submission(overrides: Partial<FeedbackSubmission> = {}): FeedbackSubmission {
  return {
    schemaVersion: 1,
    category: "usability",
    message: "  グラフの説明が分かりやすいです。  ",
    context: context(),
    ...overrides,
  };
}

test("category options preserve the UX3-1B slugs and Japanese labels", () => {
  assert.deepEqual(getFeedbackCategoryOptions(), [
    { value: "usability", label: "使いにくい" },
    { value: "understanding", label: "分かりにくい" },
    { value: "display", label: "表示がおかしい" },
    { value: "data", label: "データがおかしい" },
    { value: "feature", label: "欲しい機能" },
    { value: "other", label: "その他" },
  ]);
  assert.equal(getFeedbackCategoryLabel("data"), "データがおかしい");
});

test("valid anonymous and optional-email submissions are normalized", () => {
  const anonymous = validateFeedbackSubmission(submission());
  assert.ok(anonymous);
  assert.equal(anonymous.message, "グラフの説明が分かりやすいです。");
  assert.equal("contactEmail" in anonymous, false);

  const withEmail = validateFeedbackSubmission(submission({ contactEmail: "  user@example.com  " }));
  assert.ok(withEmail);
  assert.equal(withEmail.contactEmail, "user@example.com");
  assert.equal(isValidFeedbackSubmission(withEmail), true);
});

test("invalid category, message, and email values are rejected", () => {
  for (const value of [
    submission({ category: "bug" as FeedbackSubmission["category"] }),
    submission({ message: "" }),
    submission({ message: " \t\n\u0000 " }),
    submission({ message: "x".repeat(4001) }),
    submission({ contactEmail: "not-an-email" }),
    submission({ contactEmail: "a".repeat(250) + "@example.com" }),
  ]) {
    assert.equal(validateFeedbackSubmission(value), null);
  }
});

test("bounded context values and unknown keys are enforced", () => {
  assert.equal(validateFeedbackSubmission(submission({ context: context({ meetId: "bad id" }) })), null);
  assert.equal(validateFeedbackSubmission(submission({ context: context({ fixedRiderIds: ["a", "b", "c", "d", "e"], comparisonMode: "pinned" }) })), null);
  assert.equal(validateFeedbackSubmission(submission({ context: context({ fixedRiderIds: ["a"], comparisonMode: 2 }) })), null);
  assert.equal(validateFeedbackSubmission(submission({ context: { ...context(), extra: true } as FeedbackContext })), null);
  assert.equal(validateFeedbackSubmission({ ...submission(), extra: true } as FeedbackSubmission), null);
  assert.equal(validateFeedbackSubmission({ ...submission(), schemaVersion: 2 } as unknown as FeedbackSubmission), null);
  assert.equal(validateFeedbackSubmission(submission({ context: context({ viewportWidth: 239 }) })), null);
  assert.equal(validateFeedbackSubmission(submission({ context: context({ lap: 100001 }) })), null);
});
