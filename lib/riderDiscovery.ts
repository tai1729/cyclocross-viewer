import { DATA_BASE_URL } from "@/lib/dataSource";
import { normalizeSearchText } from "@/lib/search";
import type { MeetCategory, MeetEntry, RaceResult } from "@/lib/types";

export const RIDER_DISCOVERY_CONCURRENCY = 24;
export const RIDER_DISCOVERY_BUDGET_MS = 20_000;
export const RIDER_DISCOVERY_CACHE_TTL_MS = 10 * 60 * 1000;
export const RIDER_DISCOVERY_TTL_MS = RIDER_DISCOVERY_CACHE_TTL_MS;
export const RIDER_DISCOVERY_RESULT_LIMIT = 20;
export const RIDER_DISCOVERY_APPEARANCE_LIMIT = 6;

export interface RiderDiscoveryAppearance {
  meetId: string;
  meetName: string;
  meetDate: string;
  season: string;
  series: string;
  raceId: string;
  categoryId: string;
  categoryName: string;
}

export interface RiderDiscoveryMatch {
  riderId: string;
  name: string;
  dataQuality: "ok" | "error";
  totalAppearances: number;
  appearances: RiderDiscoveryAppearance[];
}

type IndexedAppearance = RiderDiscoveryAppearance & {
  categoryOrder: number;
  riderName: string;
  riderDataQuality: "ok" | "error";
};
type IndexedMatch = Omit<RiderDiscoveryMatch, "appearances"> & {
  appearances: IndexedAppearance[];
};

export interface RiderDiscoveryResponse {
  status: "complete" | "partial";
  query: string;
  results: RiderDiscoveryMatch[];
  scannedSources: number;
  failedSources: number;
  totalSources: number;
  warning?: "source-scan-incomplete";
}

export interface RiderDiscoverySource {
  meet: MeetEntry;
  category: MeetCategory;
  url: string;
}

export interface RiderDiscoveryIndex {
  riders: RiderDiscoveryMatch[];
  version?: 1;
  generatedAt?: string;
  scannedSources?: number;
  failedSources?: number;
  totalSources?: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isSafeInteger(value) && value >= 0;
}

function hasValidSourceCounters(index: Record<string, unknown>): boolean {
  const counterNames = ["scannedSources", "failedSources", "totalSources"] as const;
  if (counterNames.some((name) => !Object.prototype.hasOwnProperty.call(index, name) || !isNonNegativeSafeInteger(index[name]))) {
    return false;
  }

  const scannedSources = index.scannedSources;
  const failedSources = index.failedSources;
  const totalSources = index.totalSources;
  if (!isNonNegativeSafeInteger(scannedSources) || !isNonNegativeSafeInteger(failedSources) || !isNonNegativeSafeInteger(totalSources)) {
    return false;
  }
  return failedSources <= scannedSources && scannedSources <= totalSources && failedSources <= totalSources && scannedSources + failedSources === totalSources;
}

function isRiderDiscoveryAppearance(value: unknown): value is RiderDiscoveryAppearance {
  if (!value || typeof value !== "object") return false;
  const appearance = value as Partial<RiderDiscoveryAppearance>;
  return (
    isNonEmptyString(appearance.meetId) &&
    typeof appearance.meetName === "string" &&
    isNonEmptyString(appearance.meetDate) &&
    isNonEmptyString(appearance.season) &&
    isNonEmptyString(appearance.series) &&
    isNonEmptyString(appearance.raceId) &&
    isNonEmptyString(appearance.categoryId) &&
    appearance.raceId === appearance.categoryId &&
    typeof appearance.categoryName === "string"
  );
}

function isRiderDiscoveryMatch(value: unknown): value is RiderDiscoveryMatch {
  if (!value || typeof value !== "object") return false;
  const rider = value as Partial<RiderDiscoveryMatch>;
  if (
    !isNonEmptyString(rider.riderId) ||
    typeof rider.name !== "string" ||
    (rider.dataQuality !== "ok" && rider.dataQuality !== "error") ||
    !isNonNegativeSafeInteger(rider.totalAppearances) ||
    !Array.isArray(rider.appearances)
  ) return false;

  if (rider.totalAppearances < 1 || rider.appearances.length === 0 || rider.totalAppearances < rider.appearances.length || !rider.appearances.every(isRiderDiscoveryAppearance)) return false;
  const appearanceKeys = new Set<string>();
  return rider.appearances.every((appearance) => {
    const key = `${appearance.meetId}\u0000${appearance.categoryId}`;
    if (appearanceKeys.has(key)) return false;
    appearanceKeys.add(key);
    return true;
  });
}

/** Validate the collector-generated additive index without accepting unknown shapes. */
export function isRiderDiscoveryIndex(value: unknown): value is RiderDiscoveryIndex {
  if (!value || typeof value !== "object") return false;
  const index = value as Partial<RiderDiscoveryIndex> & { version?: unknown } & Record<string, unknown>;
  if (
    index.version !== 1 ||
    (Object.prototype.hasOwnProperty.call(index, "generatedAt") && !isNonEmptyString(index.generatedAt)) ||
    !hasValidSourceCounters(index) ||
    !Array.isArray(index.riders) ||
    index.riders.length === 0
  ) return false;

  const riderIds = new Set<string>();
  return index.riders.every((rider) => {
    if (!isRiderDiscoveryMatch(rider) || riderIds.has(rider.riderId)) return false;
    riderIds.add(rider.riderId);
    return true;
  });
}

export interface RiderDiscoveryScan {
  index: RiderDiscoveryIndex;
  scannedSources: number;
  failedSources: number;
  loadedSources: number;
  totalSources: number;
  status: "complete" | "partial";
  timedOut: boolean;
}

export interface RiderDiscoveryScanOptions {
  budgetMs?: number;
  concurrency?: number;
  signal?: AbortSignal;
}

export type RiderDiscoveryRaceLoader = (
  source: RiderDiscoverySource,
  signal: AbortSignal,
) => Promise<RaceResult>;
export type RiderRaceLoader = RiderDiscoveryRaceLoader;

function orderedUniqueSources(meets: readonly MeetEntry[]): RiderDiscoverySource[] {
  const ordered = meets.flatMap((meet) =>
    meet.categories.map((category) => ({
      meet,
      category,
      url: `${DATA_BASE_URL}/data/race-${encodeURIComponent(category.raceId)}.json`,
    })),
  ).sort((left, right) =>
    right.meet.meetDate.localeCompare(left.meet.meetDate) ||
    left.category.order - right.category.order ||
    left.meet.meetId.localeCompare(right.meet.meetId),
  );
  const seen = new Set<string>();
  return ordered.filter((source) => {
    if (!source.category.raceId || seen.has(source.category.raceId)) return false;
    seen.add(source.category.raceId);
    return true;
  });
}

export function createRiderDiscoverySources(meets: readonly MeetEntry[]): RiderDiscoverySource[] {
  return orderedUniqueSources(meets);
}

function isMatchingRace(source: RiderDiscoverySource, race: RaceResult): boolean {
  return race.raceId === source.category.raceId && race.category === source.category.name;
}

function toPublicAppearance({ categoryOrder, ...appearance }: IndexedAppearance): RiderDiscoveryAppearance {
  void categoryOrder;
  const { riderName, riderDataQuality, ...publicAppearance } = appearance;
  void riderName;
  void riderDataQuality;
  return publicAppearance;
}

function addRaceToIndex(index: Map<string, IndexedMatch>, source: RiderDiscoverySource, race: RaceResult): void {
  for (const rider of race.riders) {
    if (!rider.riderId.trim()) continue;
    const appearance: IndexedAppearance = {
      meetId: source.meet.meetId,
      meetName: source.meet.meetName,
      meetDate: source.meet.meetDate,
      season: source.meet.season,
      series: source.meet.series,
      raceId: race.raceId,
      categoryId: source.category.raceId,
      categoryName: source.category.name,
      categoryOrder: source.category.order,
      riderName: rider.name,
      riderDataQuality: rider.dataQuality,
    };
    const current = index.get(rider.riderId);
    if (!current) {
      index.set(rider.riderId, {
        riderId: rider.riderId,
        name: rider.name,
        dataQuality: rider.dataQuality,
        totalAppearances: 1,
        appearances: [appearance],
      });
    } else {
      current.totalAppearances += 1;
      current.appearances.push(appearance);
    }
  }
}

class ScanBudgetExceeded extends Error {}

function loadWithBudget(
  loader: RiderDiscoveryRaceLoader,
  source: RiderDiscoverySource,
  deadline: number,
  signal: AbortSignal | undefined,
): Promise<RaceResult> {
  const remaining = deadline - Date.now();
  if (remaining <= 0) return Promise.reject(new ScanBudgetExceeded());
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new ScanBudgetExceeded());
    }, remaining);
    void loader(source, controller.signal).then(resolve, reject).finally(() => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    });
  });
}

/** Injectable index-builder seam: fetch/validation is supplied by the caller. */
export async function buildRiderDiscoveryIndex(
  sources: readonly RiderDiscoverySource[],
  loadRace: RiderDiscoveryRaceLoader,
  options: RiderDiscoveryScanOptions = {},
): Promise<RiderDiscoveryScan> {
  const uniqueSources = orderedUniqueSources(
    sources.map((source) => source.meet).filter((meet, index, all) => all.indexOf(meet) === index),
  ).filter((source) => sources.some((candidate) => candidate.category.raceId === source.category.raceId));
  const deadline = Date.now() + (options.budgetMs ?? RIDER_DISCOVERY_BUDGET_MS);
  const concurrency = Math.max(1, Math.min(options.concurrency ?? RIDER_DISCOVERY_CONCURRENCY, RIDER_DISCOVERY_CONCURRENCY));
  const index = new Map<string, IndexedMatch>();
  let next = 0;
  let scannedSources = 0;
  let failedSources = 0;
  let loadedSources = 0;
  let budgetReached = false;

  async function worker(): Promise<void> {
    while (!budgetReached && !options.signal?.aborted) {
      const source = uniqueSources[next++];
      if (!source) return;
      if (Date.now() >= deadline) {
        budgetReached = true;
        return;
      }
      try {
        const race = await loadWithBudget(loadRace, source, deadline, options.signal);
        scannedSources += 1;
        if (!isMatchingRace(source, race)) throw new Error("race-source-mismatch");
        loadedSources += 1;
        addRaceToIndex(index, source, race);
      } catch (error) {
        scannedSources += 1;
        failedSources += 1;
        if (error instanceof ScanBudgetExceeded) budgetReached = true;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, uniqueSources.length) }, () => worker()));
  const riders: RiderDiscoveryMatch[] = [...index.values()].map(({ appearances, ...rider }) => {
    const orderedAppearances = appearances.sort((left, right) =>
      right.meetDate.localeCompare(left.meetDate) ||
      left.categoryOrder - right.categoryOrder ||
      left.meetId.localeCompare(right.meetId) ||
      left.categoryId.localeCompare(right.categoryId),
    );
    const newestAppearance = orderedAppearances[0];
    return {
      ...rider,
      ...(newestAppearance
        ? {
            name: newestAppearance.riderName,
            dataQuality: newestAppearance.riderDataQuality,
          }
        : {}),
      appearances: orderedAppearances
      .slice(0, RIDER_DISCOVERY_APPEARANCE_LIMIT)
      .map(toPublicAppearance),
    };
  });
  return {
    index: { riders },
    scannedSources,
    failedSources,
    loadedSources,
    totalSources: uniqueSources.length,
    status: budgetReached || scannedSources < uniqueSources.length || failedSources > 0 ? "partial" : "complete",
    timedOut: budgetReached && scannedSources < uniqueSources.length,
  };
}

export const scanRiderDiscoverySources = buildRiderDiscoveryIndex;

export function normalizeRiderDiscoveryQuery(value: string): string {
  return normalizeSearchText(value);
}

export function countUnicodeCodePoints(value: string): number {
  return [...value].length;
}

export function isRiderDiscoveryQueryUsable(value: string): boolean {
  return countUnicodeCodePoints(normalizeRiderDiscoveryQuery(value)) >= 2;
}

export function searchRiderDiscoveryIndex(index: RiderDiscoveryIndex, query: string, limit = RIDER_DISCOVERY_RESULT_LIMIT): RiderDiscoveryMatch[] {
  const normalized = normalizeRiderDiscoveryQuery(query);
  if (!isRiderDiscoveryQueryUsable(normalized)) return [];
  return index.riders
    .filter((rider) => normalizeSearchText(rider.riderId).includes(normalized) || normalizeSearchText(rider.name).includes(normalized))
    .slice(0, Math.max(0, limit));
}
