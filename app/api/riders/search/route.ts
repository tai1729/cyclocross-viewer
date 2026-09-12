import {
  countUnicodeCodePoints,
  createRiderDiscoverySources,
  normalizeRiderDiscoveryQuery,
  RIDER_DISCOVERY_CACHE_TTL_MS,
  scanRiderDiscoverySources,
  searchRiderDiscoveryIndex,
  isRiderDiscoveryIndex,
  type RiderDiscoveryIndex,
  type RiderDiscoveryRaceLoader,
  type RiderDiscoveryResponse,
} from "../../../../lib/riderDiscovery";
import {
  fetchMeets,
  fetchRaceResult,
  fetchRiderDiscoveryIndex,
} from "../../../../lib/dataSource";

export const runtime = "nodejs";

interface CompletedIndexCache {
  expiresAt: number;
  index: RiderDiscoveryIndex;
  scannedSources: number;
  failedSources: number;
  totalSources: number;
}

let completedIndexCache: CompletedIndexCache | null = null;

export function resetRiderDiscoveryCache(): void {
  completedIndexCache = null;
}

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function shortQueryResponse(): Response {
  return jsonResponse({ error: "query-too-short", retryable: false }, 400);
}

function unavailableResponse(): Response {
  return jsonResponse({ error: "source-unavailable", retryable: true }, 503);
}

function getCachedIndex(): CompletedIndexCache | null {
  if (!completedIndexCache) return null;
  if (completedIndexCache.expiresAt <= Date.now()) {
    completedIndexCache = null;
    return null;
  }
  return completedIndexCache;
}

function responseFromIndex(
  index: RiderDiscoveryIndex,
  query: string,
): RiderDiscoveryResponse {
  return {
    status: "complete",
    query,
    results: searchRiderDiscoveryIndex(index, query),
    scannedSources: index.scannedSources ?? index.riders.length,
    failedSources: index.failedSources ?? 0,
    totalSources: index.totalSources ?? index.riders.length,
  };
}

const loadRace: RiderDiscoveryRaceLoader = (source, signal) =>
  fetchRaceResult(source.url, signal);

export async function GET(request: Request): Promise<Response> {
  const rawQuery = new URL(request.url).searchParams.get("q") ?? "";
  const query = normalizeRiderDiscoveryQuery(rawQuery);
  if (countUnicodeCodePoints(query) < 2) return shortQueryResponse();

  const cached = getCachedIndex();
  if (cached) {
    return jsonResponse(
      {
        status: "complete",
        query,
        results: searchRiderDiscoveryIndex(cached.index, query),
        scannedSources: cached.scannedSources,
        failedSources: cached.failedSources,
        totalSources: cached.totalSources,
      } satisfies RiderDiscoveryResponse,
      200,
    );
  }

  try {
    try {
      const rawIndex = await fetchRiderDiscoveryIndex(request.signal);
      if (!isRiderDiscoveryIndex(rawIndex)) throw new Error("invalid-rider-index");
      const index = rawIndex;
      completedIndexCache = {
        expiresAt: Date.now() + RIDER_DISCOVERY_CACHE_TTL_MS,
        index,
        scannedSources: index.scannedSources ?? index.riders.length,
        failedSources: index.failedSources ?? 0,
        totalSources: index.totalSources ?? index.riders.length,
      };
      return jsonResponse(responseFromIndex(index, query), 200);
    } catch (indexError) {
      // The additive index is a rollout optimization. A missing or malformed
      // artifact falls back to the existing bounded scan; it is never merged
      // with a potentially stale index.
      void indexError;
    }
    const meets = await fetchMeets(request.signal);
    const sources = createRiderDiscoverySources(meets);
    const scan = await scanRiderDiscoverySources(sources, loadRace, { signal: request.signal });

    if (scan.totalSources > 0 && scan.loadedSources === 0) {
      return unavailableResponse();
    }

    const complete =
      !scan.timedOut &&
      scan.failedSources === 0 &&
      scan.scannedSources === scan.totalSources;
    if (complete) {
      completedIndexCache = {
        expiresAt: Date.now() + RIDER_DISCOVERY_CACHE_TTL_MS,
        index: scan.index,
        scannedSources: scan.scannedSources,
        failedSources: scan.failedSources,
        totalSources: scan.totalSources,
      };
    }

    const response: RiderDiscoveryResponse = {
      status: complete ? "complete" : "partial",
      query,
      results: searchRiderDiscoveryIndex(scan.index, query),
      scannedSources: scan.scannedSources,
      failedSources: scan.failedSources,
      totalSources: scan.totalSources,
      ...(complete ? {} : { warning: "source-scan-incomplete" as const }),
    };
    return jsonResponse(response, 200);
  } catch {
    return unavailableResponse();
  }
}
