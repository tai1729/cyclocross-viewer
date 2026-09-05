import type { MeetCategory, MeetEntry, Rider } from "@/lib/types";

export const MAX_FIXED_RIDERS = 4;
export const MAX_ALL_RIDERS = 8;

export type ComparisonMode = 0 | 1 | 2 | 3 | 4 | 5 | "pinned" | "all";
export type ChartTab = "rank" | "gap" | "pace" | "lap";
export type QueryPair = readonly [key: string, value: string];

export interface HomeUrlState {
  season: string;
  series: string;
  unknownParams: readonly QueryPair[];
}

export interface RaceUrlState extends HomeUrlState {
  category: string;
  rider: string;
  compare: ComparisonMode;
  fixed: readonly string[];
  tab: ChartTab;
  lap: number | null;
}

export interface NormalizedRaceUrlState extends RaceUrlState {
  /** The category selected after applying the upstream category order. */
  selectedCategoryId: string | null;
}

export type UrlSearchParamsInput =
  | string
  | URLSearchParams
  | { entries(): Iterable<readonly [unknown, unknown]> }
  | { get(name: string): unknown; getAll(name: string): Iterable<unknown> }
  | Iterable<readonly [unknown, unknown]>
  | Record<string, unknown>
  | null
  | undefined;

export interface HomeUrlSnapshot {
  meets?: readonly Pick<MeetEntry, "season" | "series">[];
  seasons?: readonly string[];
  series?: readonly string[];
  seriesBySeason?: ReadonlyMap<string, readonly string[]> | Record<string, readonly string[]>;
}

export interface RaceUrlSnapshot {
  categories: readonly (Pick<MeetCategory, "raceId" | "order"> | string)[];
  riders: readonly Pick<Rider, "riderId" | "dataQuality" | "laps">[] | readonly string[];
  graphableRiderIds?: readonly string[];
  graphableRiders?: readonly Pick<Rider, "riderId">[];
  lapNumbers: readonly number[];
}

const KNOWN_KEYS = new Set([
  "season",
  "series",
  "category",
  "rider",
  "compare",
  "fixed",
  "tab",
  "lap",
]);

function emptyUnknownParams(): QueryPair[] {
  return [];
}

function defaultHomeState(unknownParams: readonly QueryPair[] = emptyUnknownParams()): HomeUrlState {
  return { season: "", series: "", unknownParams };
}

function defaultRaceState(unknownParams: readonly QueryPair[] = emptyUnknownParams()): RaceUrlState {
  return {
    ...defaultHomeState(unknownParams),
    category: "",
    rider: "",
    compare: 2,
    fixed: [],
    tab: "rank",
    lap: null,
  };
}

function asSafeString(value: unknown): string | null {
  try {
    return typeof value === "string" ? value : String(value);
  } catch {
    return null;
  }
}

function decodeQueryPart(value: string): string | null {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return null;
  }
}

function pairsFromString(value: string): QueryPair[] {
  const query = value.startsWith("?") ? value.slice(1) : value;
  const pairs: QueryPair[] = [];
  for (const part of query.split("&")) {
    if (part === "") continue;
    const separator = part.indexOf("=");
    const rawKey = separator === -1 ? part : part.slice(0, separator);
    const rawValue = separator === -1 ? "" : part.slice(separator + 1);
    const key = decodeQueryPart(rawKey);
    const item = decodeQueryPart(rawValue);
    if (key !== null && item !== null) pairs.push([key, item]);
  }
  return pairs;
}

function pairsFromInput(input: UrlSearchParamsInput): QueryPair[] {
  if (typeof input === "string") return pairsFromString(input);
  if (input === null || input === undefined) return [];

  try {
    if (typeof input === "object" && "entries" in input && typeof input.entries === "function") {
      return [...input.entries()]
        .map(([key, value]) => {
          const safeKey = asSafeString(key);
          const safeValue = asSafeString(value);
          return safeKey === null || safeValue === null ? null : ([safeKey, safeValue] as const);
        })
        .filter((pair): pair is QueryPair => pair !== null);
    }

    if (typeof input === "object" && "getAll" in input && typeof input.getAll === "function") {
      const pairs: QueryPair[] = [];
      for (const key of KNOWN_KEYS) {
        const values = input.getAll(key);
        for (const value of values) {
          const safeValue = asSafeString(value);
          if (safeValue !== null) pairs.push([key, safeValue]);
        }
      }
      return pairs;
    }

    if (typeof input === "object" && Symbol.iterator in input) {
      return [...input as Iterable<readonly [unknown, unknown]>]
        .map(([key, value]) => {
          const safeKey = asSafeString(key);
          const safeValue = asSafeString(value);
          return safeKey === null || safeValue === null ? null : ([safeKey, safeValue] as const);
        })
        .filter((pair): pair is QueryPair => pair !== null);
    }

    if (typeof input === "object") {
      const pairs: QueryPair[] = [];
      for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            const safeValue = asSafeString(item);
            if (safeValue !== null) pairs.push([key, safeValue]);
          }
        } else {
          const safeValue = asSafeString(value);
          if (safeValue !== null) pairs.push([key, safeValue]);
        }
      }
      return pairs;
    }
  } catch {
    return [];
  }

  return [];
}

function valuesFor(pairs: readonly QueryPair[], key: string): string[] {
  return pairs.filter(([candidate]) => candidate === key).map(([, value]) => value);
}

function firstValue(pairs: readonly QueryPair[], key: string): string {
  return valuesFor(pairs, key)[0] ?? "";
}

function parseCompare(value: string): ComparisonMode {
  if (/^[0-5]$/.test(value)) return Number(value) as ComparisonMode;
  if (value === "pinned" || value === "all") return value;
  return 2;
}

function parseTab(value: string): ChartTab {
  return value === "rank" || value === "gap" || value === "pace" || value === "lap"
    ? value
    : "rank";
}

function parseLap(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const lap = Number(value);
  return Number.isSafeInteger(lap) && lap > 0 ? lap : null;
}

function unknownParamsFrom(pairs: readonly QueryPair[]): QueryPair[] {
  return pairs.filter(([key]) => !KNOWN_KEYS.has(key));
}

export function parseHomeUrlState(input: UrlSearchParamsInput): HomeUrlState {
  const pairs = pairsFromInput(input);
  return {
    ...defaultHomeState(unknownParamsFrom(pairs)),
    season: firstValue(pairs, "season"),
    series: firstValue(pairs, "series"),
  };
}

export function parseRaceUrlState(input: UrlSearchParamsInput): RaceUrlState {
  const pairs = pairsFromInput(input);
  const fixed = valuesFor(pairs, "fixed").filter((value) => value !== "");
  return {
    ...defaultRaceState(unknownParamsFrom(pairs)),
    season: firstValue(pairs, "season"),
    series: firstValue(pairs, "series"),
    category: firstValue(pairs, "category"),
    rider: firstValue(pairs, "rider"),
    compare: parseCompare(firstValue(pairs, "compare")),
    fixed,
    tab: parseTab(firstValue(pairs, "tab")),
    lap: parseLap(firstValue(pairs, "lap")),
  };
}

function uniqueNonEmpty(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (value === "" || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function isValidCheckpoint(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const lap = value as { lapNumber?: unknown; cumulativeTimeSec?: unknown; rankAtLap?: unknown };
  return (
    Number.isInteger(lap.lapNumber) &&
    (lap.lapNumber as number) > 0 &&
    Number.isFinite(lap.cumulativeTimeSec) &&
    Number.isFinite(lap.rankAtLap)
  );
}

type HomeMeetSnapshot = readonly Pick<MeetEntry, "season" | "series">[];

function isHomeMeetSnapshot(snapshot: HomeMeetSnapshot | HomeUrlSnapshot): snapshot is HomeMeetSnapshot {
  return Array.isArray(snapshot);
}

function snapshotMeets(snapshot: HomeMeetSnapshot | HomeUrlSnapshot): HomeMeetSnapshot {
  if (isHomeMeetSnapshot(snapshot)) return snapshot;
  return snapshot.meets ?? [];
}

export function normalizeHomeUrlState(
  state: HomeUrlState,
  snapshot: HomeMeetSnapshot | HomeUrlSnapshot,
): HomeUrlState {
  const meets = snapshotMeets(snapshot);
  const seasons = new Set(
    (isHomeMeetSnapshot(snapshot) ? meets.map((meet) => meet.season) : snapshot.seasons ?? meets.map((meet) => meet.season))
      .filter((value) => value !== ""),
  );
  const season = seasons.has(state.season) ? state.season : "";

  let seriesValues: readonly string[];
  if (!isHomeMeetSnapshot(snapshot) && snapshot.seriesBySeason) {
    if (season) {
      const bySeason = snapshot.seriesBySeason;
      seriesValues = isSeriesBySeasonMap(bySeason) ? bySeason.get(season) ?? [] : bySeason[season] ?? [];
    } else {
      const values = bySeasonValues(snapshot.seriesBySeason);
      seriesValues = values;
    }
  } else if (!isHomeMeetSnapshot(snapshot) && snapshot.series) {
    seriesValues = snapshot.series;
  } else {
    seriesValues = meets
      .filter((meet) => !season || meet.season === season)
      .map((meet) => meet.series);
  }

  return {
    season,
    series: seriesValues.includes(state.series) && state.series !== "" ? state.series : "",
    unknownParams: state.unknownParams,
  };
}

function bySeasonValues(
  seriesBySeason: ReadonlyMap<string, readonly string[]> | Record<string, readonly string[]>,
): string[] {
  if (isSeriesBySeasonMap(seriesBySeason)) return [...seriesBySeason.values()].flat();
  return Object.values(seriesBySeason).flat();
}

function isSeriesBySeasonMap(
  value: ReadonlyMap<string, readonly string[]> | Record<string, readonly string[]>,
): value is ReadonlyMap<string, readonly string[]> {
  return typeof value === "object" && value !== null && typeof value.get === "function";
}

function categoryId(category: Pick<MeetCategory, "raceId" | "order"> | string): string {
  return typeof category === "string" ? category : category.raceId;
}

function categoryOrder(category: Pick<MeetCategory, "raceId" | "order"> | string, index: number): [number, number] {
  return typeof category === "string" ? [index, index] : [category.order, index];
}

function riderIds(riders: RaceUrlSnapshot["riders"]): string[] {
  return riders.map((rider) => (typeof rider === "string" ? rider : rider.riderId));
}

function graphableIds(snapshot: RaceUrlSnapshot): Set<string> {
  if (snapshot.graphableRiderIds) return new Set(snapshot.graphableRiderIds);
  if (snapshot.graphableRiders) return new Set(snapshot.graphableRiders.map((rider) => rider.riderId));
  return new Set(
    snapshot.riders
      .filter((rider): rider is Pick<Rider, "riderId" | "dataQuality" | "laps"> => typeof rider !== "string")
      .filter((rider) => rider.dataQuality === "ok" && rider.laps.some(isValidCheckpoint))
      .map((rider) => rider.riderId),
  );
}

export function normalizeRaceUrlState(
  state: RaceUrlState,
  snapshot: RaceUrlSnapshot,
): NormalizedRaceUrlState {
  const orderedCategories = snapshot.categories
    .map((category, index) => ({ category, index, id: categoryId(category), order: categoryOrder(category, index) }))
    .filter(({ id }) => id !== "")
    .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1]);
  const firstCategory = orderedCategories[0]?.id ?? null;
  const selectedCategoryId = orderedCategories.some(({ id }) => id === state.category)
    ? state.category
    : firstCategory;
  const category = selectedCategoryId === firstCategory ? "" : selectedCategoryId ?? "";

  const availableRiderIds = new Set(riderIds(snapshot.riders));
  const rider = availableRiderIds.has(state.rider) ? state.rider : "";
  const graphable = new Set(
    [...graphableIds(snapshot)].filter((riderId) => availableRiderIds.has(riderId)),
  );
  const fixed = state.compare === "pinned"
    ? uniqueNonEmpty(state.fixed).filter((id) => graphable.has(id) && id !== rider).slice(0, MAX_FIXED_RIDERS)
    : [];
  const compare = state.compare === "all" && graphable.size > MAX_ALL_RIDERS ? 2 : state.compare;
  const lapAxis = new Set(snapshot.lapNumbers.filter((lap) => Number.isSafeInteger(lap) && lap > 0));

  return {
    season: state.season,
    series: state.series,
    category,
    selectedCategoryId,
    rider,
    compare,
    fixed,
    tab: state.tab,
    lap: state.lap !== null && lapAxis.has(state.lap) ? state.lap : null,
    unknownParams: state.unknownParams,
  };
}

function appendKnown(params: URLSearchParams, state: Partial<RaceUrlState>, includeRace: boolean): void {
  if (state.season) params.append("season", state.season);
  if (state.series) params.append("series", state.series);
  if (includeRace && state.category) params.append("category", state.category);
  if (includeRace && state.rider) params.append("rider", state.rider);
  if (includeRace && state.compare !== undefined && state.compare !== 2) params.append("compare", String(state.compare));
  if (includeRace && state.compare === "pinned") {
    for (const id of state.fixed ?? []) if (id) params.append("fixed", id);
  }
  if (includeRace && state.tab && state.tab !== "rank") params.append("tab", state.tab);
  if (includeRace && state.lap !== undefined && state.lap !== null) params.append("lap", String(state.lap));
}

function appendUnknown(params: URLSearchParams, unknownParams: readonly QueryPair[] | undefined): void {
  for (const [key, value] of unknownParams ?? []) {
    if (!KNOWN_KEYS.has(key)) params.append(key, value);
  }
}

export function serializeHomeUrlState(state: HomeUrlState): string {
  const params = new URLSearchParams();
  appendKnown(params, state, false);
  appendUnknown(params, state.unknownParams);
  return params.toString();
}

export function serializeRaceUrlState(state: RaceUrlState | NormalizedRaceUrlState): string {
  const params = new URLSearchParams();
  appendKnown(params, state, true);
  appendUnknown(params, state.unknownParams);
  return params.toString();
}

export type UrlStatePatch = Partial<Omit<RaceUrlState, "unknownParams">> & {
  unknownParams?: readonly QueryPair[];
};

function appendRawKnown(
  params: URLSearchParams,
  pairs: readonly QueryPair[],
  key: string,
): void {
  for (const [candidate, value] of pairs) {
    if (candidate === key) params.append(key, value);
  }
}

/** Update only the meet-known category while race-dependent values are loading. */
export function updateRaceCategoryQuery(
  input: UrlSearchParamsInput,
  category: string,
): string {
  const pairs = pairsFromInput(input);
  const params = new URLSearchParams();
  for (const key of ["season", "series", "category", "rider", "compare", "fixed", "tab", "lap"]) {
    if (key === "category") {
      if (category) params.append(key, category);
      continue;
    }
    appendRawKnown(params, pairs, key);
  }
  appendUnknown(params, unknownParamsFrom(pairs));
  return params.toString();
}

export function updateUrlQuery(input: UrlSearchParamsInput, patch: UrlStatePatch): string {
  const current = parseRaceUrlState(input);
  return serializeRaceUrlState({
    ...current,
    ...patch,
    unknownParams: patch.unknownParams ?? current.unknownParams,
  });
}

export function updateHomeUrlQuery(
  input: UrlSearchParamsInput,
  patch: Partial<Omit<HomeUrlState, "unknownParams">> & { unknownParams?: readonly QueryPair[] },
): string {
  const current = parseHomeUrlState(input);
  return serializeHomeUrlState({
    ...current,
    ...patch,
    unknownParams: patch.unknownParams ?? current.unknownParams,
  });
}

export function updateRaceUrlQuery(input: UrlSearchParamsInput, patch: UrlStatePatch): string {
  return updateUrlQuery(input, patch);
}

// Short aliases keep the pure boundary convenient for callers without changing its contracts.
export const parseHomeQuery = parseHomeUrlState;
export const parseRaceQuery = parseRaceUrlState;
export const normalizeHomeQuery = normalizeHomeUrlState;
export const normalizeRaceQuery = normalizeRaceUrlState;
export const serializeHomeQuery = serializeHomeUrlState;
export const serializeRaceQuery = serializeRaceUrlState;
