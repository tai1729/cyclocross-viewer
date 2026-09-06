export const FEEDBACK_CATEGORIES = [
  "usability",
  "understanding",
  "display",
  "data",
  "feature",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Readonly<Record<FeedbackCategory, string>> = {
  usability: "使いにくい",
  understanding: "分かりにくい",
  display: "表示がおかしい",
  data: "データがおかしい",
  feature: "欲しい機能",
  other: "その他",
};

export type FeedbackRoute = "home" | "race" | "feedback";
export type FeedbackMetric = "rank" | "gap" | "pace" | "lap";
export type FeedbackComparisonMode = 0 | 1 | 2 | 3 | 4 | 5 | "pinned" | "all";
export type FeedbackBrowserFamily =
  | "chromium"
  | "firefox"
  | "safari"
  | "edge"
  | "other"
  | "unknown";

export interface FeedbackContext {
  route: FeedbackRoute;
  meetId?: string;
  raceId?: string;
  categoryId?: string;
  riderId?: string;
  fixedRiderIds?: string[];
  metric?: FeedbackMetric;
  comparisonMode?: FeedbackComparisonMode;
  lap?: number;
  season?: string;
  series?: string;
  viewportWidth: number;
  viewportHeight: number;
  browserFamily: FeedbackBrowserFamily;
  appVersion: string;
}

export interface FeedbackSubmission {
  schemaVersion: 1;
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
  context: FeedbackContext;
}

const CONTEXT_KEYS = new Set<keyof FeedbackContext>([
  "route",
  "meetId",
  "raceId",
  "categoryId",
  "riderId",
  "fixedRiderIds",
  "metric",
  "comparisonMode",
  "lap",
  "season",
  "series",
  "viewportWidth",
  "viewportHeight",
  "browserFamily",
  "appVersion",
]);

const SUBMISSION_KEYS = new Set(["schemaVersion", "category", "message", "contactEmail", "context"]);
const ID_PATTERN = /^[A-Za-z0-9._:-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_OR_WHITESPACE_ONLY = /^[\s\p{Cc}\p{Cf}]*$/u;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function codePointLength(value: string): number {
  return [...value].length;
}

function optionalString(
  value: unknown,
  maxLength: number,
  predicate: (value: string) => boolean = () => true,
): string | undefined | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return codePointLength(trimmed) <= maxLength && predicate(trimmed) ? trimmed : null;
}

function validId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 1 &&
    value.length <= 128 &&
    ID_PATTERN.test(value)
  );
}

function normalizeId(value: unknown): string | null | undefined {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return validId(trimmed) ? trimmed : null;
}

function normalizeFixedRiderIds(value: unknown): string[] | null | undefined {
  if (!Array.isArray(value)) return null;
  if (value.length > 4) return null;

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const id = normalizeId(item);
    if (id === null || id === undefined || seen.has(id)) return null;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function normalizeContext(value: unknown): FeedbackContext | null {
  if (!isRecord(value) || !hasOnlyKeys(value, CONTEXT_KEYS)) return null;

  const route = value.route;
  if (route !== "home" && route !== "race" && route !== "feedback") return null;

  const viewportWidth = value.viewportWidth;
  const viewportHeight = value.viewportHeight;
  if (
    typeof viewportWidth !== "number" ||
    !Number.isInteger(viewportWidth) ||
    viewportWidth < 240 ||
    viewportWidth > 10000 ||
    typeof viewportHeight !== "number" ||
    !Number.isInteger(viewportHeight) ||
    viewportHeight < 240 ||
    viewportHeight > 10000
  ) {
    return null;
  }

  const browserFamily = value.browserFamily;
  if (
    browserFamily !== "chromium" &&
    browserFamily !== "firefox" &&
    browserFamily !== "safari" &&
    browserFamily !== "edge" &&
    browserFamily !== "other" &&
    browserFamily !== "unknown"
  ) {
    return null;
  }

  const appVersion = optionalString(value.appVersion, 64);
  if (appVersion === null || appVersion === undefined) return null;

  const context: FeedbackContext = {
    route,
    viewportWidth,
    viewportHeight,
    browserFamily,
    appVersion,
  };

  for (const key of ["meetId", "raceId", "categoryId", "riderId"] as const) {
    if (!(key in value)) continue;
    const id = normalizeId(value[key]);
    if (id === null) return null;
    if (id !== undefined) context[key] = id;
  }

  if ("fixedRiderIds" in value) {
    const fixedRiderIds = normalizeFixedRiderIds(value.fixedRiderIds);
    if (fixedRiderIds === null) return null;
    if (fixedRiderIds !== undefined) context.fixedRiderIds = fixedRiderIds;
  }

  if ("metric" in value) {
    if (value.metric !== "rank" && value.metric !== "gap" && value.metric !== "pace" && value.metric !== "lap") {
      return null;
    }
    context.metric = value.metric;
  }

  if ("comparisonMode" in value) {
    const comparisonMode = value.comparisonMode;
    if (
      !(
        (typeof comparisonMode === "number" && Number.isInteger(comparisonMode) && comparisonMode >= 0 && comparisonMode <= 5) ||
        comparisonMode === "pinned" ||
        comparisonMode === "all"
      )
    ) {
      return null;
    }
    context.comparisonMode = comparisonMode as FeedbackComparisonMode;
  }

  if (context.fixedRiderIds && context.comparisonMode !== "pinned") return null;

  if ("lap" in value) {
    if (typeof value.lap !== "number" || !Number.isSafeInteger(value.lap) || value.lap < 1 || value.lap > 100000) {
      return null;
    }
    context.lap = value.lap;
  }

  for (const key of ["season", "series"] as const) {
    if (!(key in value)) continue;
    const item = optionalString(value[key], 64);
    if (item === null) return null;
    if (item !== undefined) context[key] = item;
  }

  return context;
}

export function getFeedbackCategoryLabel(category: FeedbackCategory): string {
  return FEEDBACK_CATEGORY_LABELS[category];
}

export function getFeedbackCategoryOptions(): ReadonlyArray<{ value: FeedbackCategory; label: string }> {
  return FEEDBACK_CATEGORIES.map((value) => ({ value, label: FEEDBACK_CATEGORY_LABELS[value] }));
}

export function validateFeedbackContext(value: unknown): FeedbackContext | null {
  return normalizeContext(value);
}

export function validateFeedbackSubmission(value: unknown): FeedbackSubmission | null {
  if (!isRecord(value) || !hasOnlyKeys(value, SUBMISSION_KEYS) || value.schemaVersion !== 1) return null;
  if (!FEEDBACK_CATEGORIES.includes(value.category as FeedbackCategory)) return null;

  if (typeof value.message !== "string") return null;
  const message = value.message.trim();
  if (
    codePointLength(message) < 1 ||
    codePointLength(message) > 4000 ||
    CONTROL_OR_WHITESPACE_ONLY.test(message)
  ) {
    return null;
  }

  let contactEmail: string | undefined;
  if ("contactEmail" in value) {
    const email = optionalString(value.contactEmail, 254, (candidate) => EMAIL_PATTERN.test(candidate));
    if (email === null) return null;
    contactEmail = email;
  }

  const context = normalizeContext(value.context);
  if (context === null) return null;

  return {
    schemaVersion: 1,
    category: value.category as FeedbackCategory,
    message,
    ...(contactEmail ? { contactEmail } : {}),
    context,
  };
}

export function isValidFeedbackContext(value: unknown): value is FeedbackContext {
  return validateFeedbackContext(value) !== null;
}

export function isValidFeedbackSubmission(value: unknown): value is FeedbackSubmission {
  return validateFeedbackSubmission(value) !== null;
}

export const parseFeedbackSubmission = validateFeedbackSubmission;
