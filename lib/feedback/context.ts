import packageJson from "../../package.json";
import type {
  FeedbackBrowserFamily,
  FeedbackComparisonMode,
  FeedbackContext,
  FeedbackMetric,
} from "./feedbackSchema";

const MIN_VIEWPORT = 240;
const MAX_VIEWPORT = 10000;
const ID_PATTERN = /^[A-Za-z0-9._:-]+$/;
const KNOWN_QUERY_KEYS = new Set(["season", "series", "category", "rider", "compare", "fixed", "tab", "lap"]);

export interface FeedbackLocationLike {
  pathname: string;
  search?: string;
}

export interface FeedbackContextBuildOptions {
  pathname?: string;
  search?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  viewport?: { width?: number; height?: number };
  userAgent?: string;
  appVersion?: string;
  location?: string | URL | FeedbackLocationLike;
}

type LocationInput = string | URL | FeedbackLocationLike;

function codePointLength(value: string): number {
  return [...value].length;
}

function readLocation(input: LocationInput | undefined): FeedbackLocationLike {
  if (input instanceof URL) return { pathname: input.pathname, search: input.search };

  if (input && typeof input === "object" && "pathname" in input) {
    return { pathname: input.pathname, search: input.search ?? "" };
  }

  if (typeof input === "string") {
    try {
      const url = new URL(input, "http://feedback.local");
      return { pathname: url.pathname, search: url.search };
    } catch {
      const separator = input.indexOf("?");
      return {
        pathname: separator === -1 ? input : input.slice(0, separator),
        search: separator === -1 ? "" : input.slice(separator),
      };
    }
  }

  if (typeof window !== "undefined") {
    return { pathname: window.location.pathname, search: window.location.search };
  }
  return { pathname: "/", search: "" };
}

function readOptionsLocation(options: FeedbackContextBuildOptions): FeedbackLocationLike {
  if (options.location !== undefined) return readLocation(options.location);
  return readLocation({ pathname: options.pathname ?? "/", search: options.search ?? "" });
}

function queryValues(search: string, key: string): string[] {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    return params.getAll(key);
  } catch {
    return [];
  }
}

function firstQueryValue(search: string, key: string): string | undefined {
  return queryValues(search, key)[0];
}

function validId(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 128 && ID_PATTERN.test(trimmed) ? trimmed : undefined;
}

function validBoundedText(value: string | undefined, maxLength: number): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed !== "" && codePointLength(trimmed) <= maxLength ? trimmed : undefined;
}

function parseComparisonMode(value: string | undefined): FeedbackComparisonMode | undefined {
  if (value !== undefined && /^[0-5]$/.test(value)) return Number(value) as FeedbackComparisonMode;
  if (value === "pinned" || value === "all") return value;
  return undefined;
}

function parseMetric(value: string | undefined): FeedbackMetric | undefined {
  return value === "rank" || value === "gap" || value === "pace" || value === "lap" ? value : undefined;
}

function parseLap(value: string | undefined): number | undefined {
  if (value === undefined || !/^[1-9]\d*$/.test(value)) return undefined;
  const lap = Number(value);
  return Number.isSafeInteger(lap) && lap <= 100000 ? lap : undefined;
}

function normalizeViewport(value: number | undefined): number {
  const rounded = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : MIN_VIEWPORT;
  return Math.min(MAX_VIEWPORT, Math.max(MIN_VIEWPORT, rounded));
}

function readViewport(options: FeedbackContextBuildOptions): [number, number] {
  const browserViewport = typeof window !== "undefined" ? window : undefined;
  return [
    normalizeViewport(options.viewportWidth ?? options.viewport?.width ?? browserViewport?.innerWidth),
    normalizeViewport(options.viewportHeight ?? options.viewport?.height ?? browserViewport?.innerHeight),
  ];
}

function readUserAgent(options: FeedbackContextBuildOptions): string {
  if (options.userAgent !== undefined) return options.userAgent;
  return typeof navigator !== "undefined" ? navigator.userAgent : "";
}

function publicAppVersion(options: FeedbackContextBuildOptions): string {
  const explicit = validBoundedText(options.appVersion, 64);
  if (explicit) return explicit;

  const publicVersion = validBoundedText(
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_APP_VERSION : undefined,
    64,
  );
  if (publicVersion) return publicVersion;

  const packageVersion = validBoundedText(typeof packageJson.version === "string" ? packageJson.version : undefined, 64);
  return packageVersion ?? "unknown";
}

export function normalizeBrowserFamily(userAgent: string | undefined): FeedbackBrowserFamily {
  if (typeof userAgent !== "string" || userAgent.trim() === "") return "unknown";
  const ua = userAgent.toLowerCase();

  if (/\b(?:edg|edge|edgios|edga)\//.test(ua)) return "edge";
  if (/\b(?:firefox|fxios)\//.test(ua)) return "firefox";
  if (/\b(?:chrome|chromium|crios|opr|opera)\//.test(ua)) return "chromium";
  if (/\bsafari\//.test(ua)) return "safari";
  return "other";
}

export function buildFeedbackContext(
  input: FeedbackContextBuildOptions | LocationInput = {},
  additionalOptions: FeedbackContextBuildOptions = {},
): FeedbackContext {
  const options: FeedbackContextBuildOptions = typeof input === "string" || input instanceof URL
    ? { ...additionalOptions, location: input }
    : "pathname" in input || "search" in input || "location" in input || "viewportWidth" in input || "viewportHeight" in input || "userAgent" in input || "appVersion" in input || "viewport" in input
      ? input
      : additionalOptions;
  const location = readOptionsLocation(options);
  const pathname = location.pathname || "/";
  const search = location.search ?? "";
  const segments = pathname.split("/").filter(Boolean);
  const isRace = segments[0] === "race";
  const route: FeedbackContext["route"] = pathname === "/feedback" || segments[0] === "feedback"
    ? "feedback"
    : isRace
      ? "race"
      : "home";
  const [viewportWidth, viewportHeight] = readViewport(options);
  const context: FeedbackContext = {
    route,
    viewportWidth,
    viewportHeight,
    browserFamily: normalizeBrowserFamily(readUserAgent(options)),
    appVersion: publicAppVersion(options),
  };

  if (route === "home" || route === "race") {
    const season = validBoundedText(firstQueryValue(search, "season"), 64);
    const series = validBoundedText(firstQueryValue(search, "series"), 64);
    if (season) context.season = season;
    if (series) context.series = series;
  }

  if (route === "race") {
    const meetId = validId(segments[1]);
    if (meetId) context.meetId = meetId;

    const categoryId = validId(firstQueryValue(search, "category"));
    if (categoryId) {
      context.raceId = categoryId;
      context.categoryId = categoryId;
    }

    const riderId = validId(firstQueryValue(search, "rider"));
    if (riderId) context.riderId = riderId;

    const comparisonMode = parseComparisonMode(firstQueryValue(search, "compare"));
    if (comparisonMode !== undefined) context.comparisonMode = comparisonMode;

    const metric = parseMetric(firstQueryValue(search, "tab"));
    if (metric) context.metric = metric;

    const lap = parseLap(firstQueryValue(search, "lap"));
    if (lap !== undefined) context.lap = lap;

    if (comparisonMode === "pinned") {
      const fixed = queryValues(search, "fixed");
      const fixedIds: string[] = [];
      const seen = new Set<string>();
      for (const candidate of fixed) {
        const id = validId(candidate);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        fixedIds.push(id);
        if (fixedIds.length === 4) break;
      }
      if (fixedIds.length > 0) context.fixedRiderIds = fixedIds;
    }
  }

  return context;
}

export function buildFeedbackContextFromLocation(
  location: LocationInput,
  options: Omit<FeedbackContextBuildOptions, "location" | "pathname" | "search"> = {},
): FeedbackContext {
  return buildFeedbackContext({ ...options, location });
}

export function snapshotFeedbackContext(context: FeedbackContext): FeedbackContext {
  return {
    ...context,
    ...(context.fixedRiderIds ? { fixedRiderIds: [...context.fixedRiderIds] } : {}),
  };
}

export const cloneFeedbackContext = snapshotFeedbackContext;

export function getFeedbackReturnPath(location: LocationInput): string {
  const resolved = readLocation(location);
  const pathname = resolved.pathname || "/";
  if (pathname === "/feedback" || pathname.startsWith("/feedback/")) return "/";
  const search = resolved.search ?? "";
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const output = new URLSearchParams();
    for (const key of KNOWN_QUERY_KEYS) {
      for (const value of params.getAll(key)) output.append(key, value);
    }
    const query = output.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  } catch {
    return pathname;
  }
}
