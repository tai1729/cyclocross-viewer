"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRaceData } from "@/hooks/useRaceData";
import {
  DATA_BASE_URL,
  describeDataLoadError,
} from "@/lib/dataSource";
import {
  MAX_ALL_COMPARISON_RIDERS,
  MAX_PINNED_FIXED_RIDERS,
  useComparisonRiders,
} from "@/hooks/useComparisonRiders";
import {
  getRaceLapNumbers,
  getRiderById,
  getRiderResult,
  getRiderSummary,
  getValidCheckpoints,
} from "@/lib/dataTransform";
import type { MeetEntry } from "@/lib/types";
import {
  normalizeRaceUrlState,
  parseRaceUrlState,
  serializeHomeUrlState,
  serializeRaceUrlState,
  updateRaceCategoryQuery,
  updateRaceUrlQuery,
  type ChartTab,
  type ComparisonMode,
  type UrlStatePatch,
} from "@/lib/urlState";
import {
  getRaceNavigationOptions,
  type RaceNavigationAction,
} from "@/lib/raceNavigation";
import {
  classifyResultsPresentation,
  getAnalysisPresentationOrder,
  getResultsDisclosureOpen,
} from "@/lib/resultsPresentation";
import { RaceHeader } from "@/components/RaceHeader";
import { RaceResultsTable } from "@/components/RaceResultsTable";
import { RiderSelector } from "@/components/RiderSelector";
import { SummaryCard } from "@/components/SummaryCard";
import { LapSummaryCard } from "@/components/LapSummaryCard";
import { LapDetailTable } from "@/components/LapDetailTable";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ComparisonRiderPicker } from "@/components/ComparisonRiderPicker";
import { ChartTabs } from "@/components/ChartTabs";
import {
  AnalysisContextBar,
  getAnalysisComparisonLabel,
  getAnalysisMetricLabel,
  getAnalysisRiderStatus,
} from "@/components/AnalysisContextBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RaceViewerProps {
  meet: MeetEntry;
}

const ANALYSIS_REGION_ID = "race-analysis";

function isCurrentVisibleFocusTarget(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement) || !element.isConnected) return false;
  if (
    element.matches(":disabled, [aria-disabled=\"true\"]") ||
    element.closest("fieldset:disabled") ||
    element.closest("[hidden], [aria-hidden=\"true\"]")
  ) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || element.getClientRects().length === 0) {
    return false;
  }

  if (element.getAttribute("role") === "tab") {
    return element.getAttribute("aria-selected") === "true";
  }
  if (element.hasAttribute("aria-pressed")) {
    return element.getAttribute("aria-pressed") === "true";
  }

  if (element.matches("[data-race-category-trigger], #category-select")) return true;

  return Boolean(
    element.closest(`#${ANALYSIS_REGION_ID}`) &&
    element.matches(
      [
        "button",
        "input",
        "select",
        "textarea",
        "a[href]",
        '[role="button"]',
        '[role="checkbox"]',
        '[role="combobox"]',
        '[role="listbox"]',
        '[role="menuitem"]',
        '[role="menuitemcheckbox"]',
        '[role="menuitemradio"]',
        '[role="option"]',
        '[role="radio"]',
        '[role="searchbox"]',
        '[role="slider"]',
        '[role="spinbutton"]',
        '[role="switch"]',
        '[role="textbox"]',
      ].join(", "),
    ),
  );
}

function focusCurrentAnalysisControl(): void {
  const analysisRegion = document.getElementById(ANALYSIS_REGION_ID);
  const target = analysisRegion?.querySelector<HTMLElement>(
    '[role="tab"][aria-selected="true"], [data-race-rider-trigger], input',
  );
  if (target && !target.hasAttribute("disabled")) {
    target.focus({ preventScroll: true });
  } else if (analysisRegion instanceof HTMLElement) {
    analysisRegion.focus({ preventScroll: true });
  }
}

function useIsDesktopPresentation(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(min-width: 1024px)");
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

interface RaceViewState {
  categoryId: string;
  selfRiderId: string | null;
  pinnedRiderIds: string[];
  comparisonMode: ComparisonMode;
  activeTab: ChartTab;
  activeLapNumber: number | null;
  pinnedLapNumber: number | null;
}

function resolveCategoryId(categories: MeetEntry["categories"], requestedId: string): string {
  return categories.find((category) => category.raceId === requestedId)?.raceId
    ?? categories[0]?.raceId
    ?? "";
}

function viewStateFromUrl(
  urlState: ReturnType<typeof parseRaceUrlState>,
  categoryId: string,
): RaceViewState {
  return {
    categoryId,
    selfRiderId: urlState.rider || null,
    pinnedRiderIds: [...urlState.fixed],
    comparisonMode: urlState.compare,
    activeTab: urlState.tab,
    activeLapNumber: urlState.lap,
    pinnedLapNumber: urlState.lap,
  };
}

function getReturnContext(
  urlState: ReturnType<typeof parseRaceUrlState>,
  meet: MeetEntry,
): { season: string; series: string } {
  if (
    (!urlState.season || urlState.season === meet.season) &&
    (!urlState.series || urlState.series === meet.series)
  ) {
    return { season: urlState.season, series: urlState.series };
  }
  return { season: "", series: "" };
}

export function RaceViewer({ meet }: RaceViewerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const isDesktop = useIsDesktopPresentation();
  const urlState = useMemo(() => parseRaceUrlState(queryString), [queryString]);
  const categories = useMemo(
    () => [...meet.categories].sort((a, b) => a.order - b.order),
    [meet.categories],
  );
  const resolvedCategoryId = resolveCategoryId(categories, urlState.category);
  const selectedCategory = categories.find((category) => category.raceId === resolvedCategoryId) ?? categories[0];
  const urlViewState = useMemo(() => viewStateFromUrl(urlState, resolvedCategoryId), [resolvedCategoryId, urlState]);
  const [hoverState, setHoverState] = useState<{
    queryString: string;
    raceId: string;
    lapNumber: number;
  } | null>(null);
  const isPopstateRef = useRef(false);
  const isProgrammaticNavigationRef = useRef(false);
  const isCanonicalizationRef = useRef(false);
  const pendingCanonicalQueryRef = useRef<string | null>(null);
  const previousNavigationRef = useRef({
    categoryId: resolvedCategoryId,
    queryString,
  });
  const [resultsOpen, setResultsOpen] = useState(false);
  const wasAnalyzingRef = useRef(urlViewState.selfRiderId !== null);

  const { race, isLoading, error, retry } = useRaceData(
    selectedCategory ? `${DATA_BASE_URL}/data/race-${selectedCategory.raceId}.json` : undefined,
  );

  const validRiders = useMemo(
    () => race?.riders.filter((rider) => rider.dataQuality === "ok") ?? [],
    [race],
  );
  const graphableRiders = useMemo(
    () => validRiders.filter((rider) => getValidCheckpoints(rider).length > 0),
    [validRiders],
  );
  const normalizedUrlState = useMemo(() => {
    if (!race || isLoading || error) return null;
    return normalizeRaceUrlState(urlState, {
      categories,
      riders: race.riders,
      graphableRiderIds: graphableRiders.map((rider) => rider.riderId),
      lapNumbers: getRaceLapNumbers(race),
    });
  }, [categories, error, graphableRiders, isLoading, race, urlState]);
  const loadedViewState = normalizedUrlState && race
    ? {
        ...viewStateFromUrl(
          normalizedUrlState,
          normalizedUrlState.selectedCategoryId ?? resolvedCategoryId,
        ),
        activeLapNumber: normalizedUrlState.lap ?? getRaceLapNumbers(race)[0] ?? null,
        pinnedLapNumber: normalizedUrlState.lap,
      }
    : null;
  const durableViewState = loadedViewState ?? urlViewState;
  const hoveredLapNumber =
    hoverState?.queryString === queryString && hoverState.raceId === race?.raceId
      ? hoverState.lapNumber
      : null;
  const currentViewState = {
    ...durableViewState,
    activeLapNumber:
      durableViewState.pinnedLapNumber ??
      (race && hoveredLapNumber !== null && getRaceLapNumbers(race).includes(hoveredLapNumber)
        ? hoveredLapNumber
        : durableViewState.activeLapNumber),
  };

  useEffect(() => {
    if (!selectedCategory || (race && !isLoading && !error)) return;

    const canonicalCategory = selectedCategory.raceId === categories[0]?.raceId
      ? ""
      : selectedCategory.raceId;
    if (urlState.category === canonicalCategory) return;

    const canonicalQuery = updateRaceCategoryQuery(searchParams, canonicalCategory);
    if (canonicalQuery !== queryString) {
      isCanonicalizationRef.current = true;
      pendingCanonicalQueryRef.current = canonicalQuery;
      void router.replace(
        canonicalQuery ? `${pathname}?${canonicalQuery}` : pathname,
        { scroll: false },
      );
    }
  }, [categories, error, isLoading, pathname, queryString, race, router, searchParams, selectedCategory, urlState.category]);

  useEffect(() => {
    if (!normalizedUrlState || !race) return;

    const context = getReturnContext(urlState, meet);
    const canonicalQuery = serializeRaceUrlState({
      ...normalizedUrlState,
      season: context.season,
      series: context.series,
    });
    if (canonicalQuery !== queryString) {
      isCanonicalizationRef.current = true;
      pendingCanonicalQueryRef.current = canonicalQuery;
      void router.replace(
        canonicalQuery ? `${pathname}?${canonicalQuery}` : pathname,
        { scroll: false },
      );
    }
  }, [meet, normalizedUrlState, pathname, queryString, race, router, urlState]);

  useEffect(() => {
    const handlePopState = () => {
      isPopstateRef.current = true;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const previousNavigation = previousNavigationRef.current;
    const queryChanged = previousNavigation.queryString !== queryString;
    const isProgrammaticNavigation = isProgrammaticNavigationRef.current;
    const isCanonicalization = isCanonicalizationRef.current;
    const isCanonicalizationResult = pendingCanonicalQueryRef.current === queryString;
    if (isProgrammaticNavigation || isCanonicalization || isCanonicalizationResult) {
      isProgrammaticNavigationRef.current = false;
      isCanonicalizationRef.current = false;
      if (isCanonicalizationResult) pendingCanonicalQueryRef.current = null;
      isPopstateRef.current = false;
      previousNavigationRef.current = { categoryId: resolvedCategoryId, queryString };
      return;
    }
    if (!isPopstateRef.current && !queryChanged) return;
    if (!race || isLoading || error || !normalizedUrlState) return;

    const context = getReturnContext(urlState, meet);
    const canonicalQuery = serializeRaceUrlState({
      ...normalizedUrlState,
      season: context.season,
      series: context.series,
    });
    if (canonicalQuery !== queryString) {
      isPopstateRef.current = false;
      previousNavigationRef.current = { categoryId: resolvedCategoryId, queryString };
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (previousNavigation.categoryId !== resolvedCategoryId) {
        document.querySelector<HTMLElement>("[data-race-category-trigger]")?.focus({ preventScroll: true });
      } else if (!isCurrentVisibleFocusTarget(document.activeElement)) {
        focusCurrentAnalysisControl();
      }
      isPopstateRef.current = false;
      previousNavigationRef.current = { categoryId: resolvedCategoryId, queryString };
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [error, isLoading, meet, normalizedUrlState, queryString, race, resolvedCategoryId, urlState]);

  const selfRiderId = currentViewState.selfRiderId;
  const pinnedRiderIds = currentViewState.pinnedRiderIds;
  const comparisonMode = currentViewState.comparisonMode;
  const comparisonRiders = useComparisonRiders(
    graphableRiders,
    selfRiderId,
    comparisonMode,
    pinnedRiderIds,
  );

  useEffect(() => {
    const isAnalyzing = selfRiderId !== null;
    if (isAnalyzing && !wasAnalyzingRef.current) {
      setResultsOpen(false);
    }
    wasAnalyzingRef.current = isAnalyzing;
  }, [selfRiderId]);

  function pushRaceUrl(patch: UrlStatePatch, action: RaceNavigationAction) {
    const context = getReturnContext(urlState, meet);
    const currentQuery = searchParams.toString();
    const nextQuery = updateRaceUrlQuery(searchParams, {
      ...patch,
      season: context.season,
      series: context.series,
    });
    if (nextQuery === currentQuery) return;
    setHoverState(null);
    isProgrammaticNavigationRef.current = true;
    void router.push(
      nextQuery ? `${pathname}?${nextQuery}` : pathname,
      getRaceNavigationOptions(action, selfRiderId !== null),
    );
  }

  function selectPrimaryRider(riderId: string) {
    const nextPinnedRiderIds = pinnedRiderIds.filter((pinnedId) => pinnedId !== riderId);
    pushRaceUrl({ rider: riderId, fixed: nextPinnedRiderIds }, "rider");
  }

  function addPinnedRider(riderId: string) {
    if (
      riderId === selfRiderId ||
      pinnedRiderIds.includes(riderId) ||
      pinnedRiderIds.length >= MAX_PINNED_FIXED_RIDERS
    ) return;
    const nextPinnedRiderIds = [...pinnedRiderIds, riderId];
    pushRaceUrl({ fixed: nextPinnedRiderIds }, "comparison");
  }

  function removePinnedRider(riderId: string) {
    const nextPinnedRiderIds = pinnedRiderIds.filter((pinnedId) => pinnedId !== riderId);
    pushRaceUrl({ fixed: nextPinnedRiderIds }, "comparison");
  }

  function changeCategory(value: string) {
    const nextCategoryId = resolveCategoryId(categories, value);
    if (!nextCategoryId) return;
    pushRaceUrl({
      category: nextCategoryId === categories[0]?.raceId ? "" : nextCategoryId,
      rider: "",
      compare: 2,
      fixed: [],
      tab: "rank",
      lap: null,
    }, "category");
  }

  function changeComparisonMode(mode: ComparisonMode) {
    if (mode === "all" && graphableRiders.length > MAX_ALL_COMPARISON_RIDERS) return;
    const nextPinnedRiderIds = mode === "pinned" ? pinnedRiderIds : [];
    pushRaceUrl({ compare: mode, fixed: nextPinnedRiderIds }, "comparison");
  }

  function changeTab(tab: ChartTab) {
    pushRaceUrl({ tab, lap: currentViewState.pinnedLapNumber }, "metric");
  }

  function hoverLap(lapNumber: number) {
    if (currentViewState.pinnedLapNumber === null && race && getRaceLapNumbers(race).includes(lapNumber)) {
      setHoverState({ queryString, raceId: race.raceId, lapNumber });
    }
  }

  function selectLap(lapNumber: number) {
    pushRaceUrl({ lap: lapNumber }, "lap");
  }

  function clearLap() {
    pushRaceUrl({ lap: null }, "lap");
  }

  const returnContext = getReturnContext(urlState, meet);
  const returnContextQuery = serializeHomeUrlState({ ...returnContext, unknownParams: [] });
  const listHref = returnContextQuery ? `/?${returnContextQuery}` : "/";

  if (!selectedCategory) {
    return <Alert variant="destructive"><AlertTitle>カテゴリーがありません</AlertTitle><AlertDescription>この大会にはカテゴリー情報がありません。</AlertDescription></Alert>;
  }

  if (isLoading && !error) return <div className="p-4 text-center text-muted-foreground" role="status">リザルトを読み込み中…</div>;
  if (error || !race) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        <Alert variant="destructive">
          <AlertTitle>レースデータを取得できませんでした</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>
              {error
                ? describeDataLoadError(
                    error,
                    `${meet.meetName} / ${selectedCategory.name || "選択カテゴリー"}`,
                  )
                : "レースデータを表示できません。"}
            </span>
            <span className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={retry}
                disabled={isLoading}
                className="min-h-11"
              >
                {isLoading ? "再試行中…" : "再試行"}
              </Button>
              <Link
                href={listHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-3 font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                大会一覧へ戻る
              </Link>
            </span>
            <span className="sr-only" aria-live="polite">
              {isLoading ? "レースデータを再取得しています" : ""}
            </span>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const selfRider = selfRiderId ? getRiderById(race, selfRiderId) : undefined;
  const hasValidData = selfRider?.dataQuality === "ok";
  const hasLapData = selfRider
    ? getValidCheckpoints(selfRider).length > 0
    : false;
  const summary = selfRiderId && hasValidData && hasLapData
    ? getRiderSummary(race, selfRiderId)
    : null;
  const fixedRiders = comparisonMode === "pinned"
    ? comparisonRiders.filter((rider) => rider.riderId !== selfRider?.riderId)
    : [];
  const riderResult = selfRider
    ? getRiderResult(race, selfRider.riderId)
    : null;
  const isAnalysisState = selfRiderId !== null;
  const analysisPresentationOrder = getAnalysisPresentationOrder(isDesktop);
  const resultsPresentation = classifyResultsPresentation(isDesktop, isAnalysisState);

  const resultsTable = (
    <RaceResultsTable
      race={race}
      selectedRiderId={selfRiderId}
      onSelect={selectPrimaryRider}
      analysisRegionId={race.riders.length > 0 ? ANALYSIS_REGION_ID : undefined}
    />
  );

  const analysisRail = (
    <div className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-start-3">
      <RiderSelector
        riders={race.riders}
        categoryName={race.category}
        selectedRiderId={selfRiderId}
        onSelect={selectPrimaryRider}
      />
      {summary && (
        <>
          <SummaryCard summary={summary} />
          {selfRider && (
            <LapSummaryCard
              primaryRider={selfRider}
              fixedRiders={fixedRiders}
            />
          )}
          <ComparisonAdjuster
            mode={comparisonMode}
            displayedCount={comparisonRiders.length}
            totalRiderCount={graphableRiders.length}
            pinnedCount={pinnedRiderIds.length}
            onChange={changeComparisonMode}
          />
          {comparisonMode === "pinned" && (
            <ComparisonRiderPicker
              riders={graphableRiders}
              primaryRiderId={selfRiderId}
              pinnedRiderIds={pinnedRiderIds}
              onAdd={addPinnedRider}
              onRemove={removePinnedRider}
            />
          )}
        </>
      )}
    </div>
  );

  const analysisChart = summary && selfRider ? (
    <div>
      <ChartTabs
        race={race}
        selfRider={selfRider}
        comparisonRiders={comparisonRiders}
        fixedRiderIds={comparisonMode === "pinned" ? pinnedRiderIds : []}
        isAllMode={comparisonMode === "all"}
        activeTab={currentViewState.activeTab}
        activeLapNumber={currentViewState.activeLapNumber}
        pinnedLapNumber={currentViewState.pinnedLapNumber}
        onTabChange={changeTab}
        onLapHover={hoverLap}
        onLapSelect={selectLap}
        onLapChange={selectLap}
        onClearPin={clearLap}
      />
    </div>
  ) : null;

  const analysisLapDetail = summary && selfRider ? (
    <div>
      <LapDetailTable
        primaryRider={selfRider}
        fixedRiders={fixedRiders}
      />
    </div>
  ) : null;

  const analysisMain = (
    <div className="flex min-w-0 flex-col gap-4 lg:col-start-2 lg:row-start-3">
      {selfRider && !hasValidData ? (
        <Alert><AlertTitle>グラフを表示できません</AlertTitle><AlertDescription>この選手の周回データには異常があります。</AlertDescription></Alert>
      ) : selfRider && !hasLapData ? (
        <Alert><AlertTitle>周回データがありません</AlertTitle><AlertDescription>この選手にはグラフ表示に必要な周回データがありません。</AlertDescription></Alert>
      ) : summary && selfRider ? (
        analysisPresentationOrder.chartTabsBeforeLapDetail ? (
          <>
            {analysisChart}
            {analysisLapDetail}
          </>
        ) : (
          <>
            {analysisLapDetail}
            {analysisChart}
          </>
        )
      ) : (
        <Alert><AlertTitle>選手を選択してください</AlertTitle><AlertDescription>選手を選ぶと周回データを比較できます。</AlertDescription></Alert>
      )}
    </div>
  );

  const activeResultsDisclosure = isAnalysisState ? (
    <details
      open={getResultsDisclosureOpen(resultsPresentation, resultsOpen)}
      onToggle={(event) => setResultsOpen(event.currentTarget.open)}
      className="order-1 min-w-0 lg:order-2"
    >
      <summary className="hidden min-h-11 cursor-pointer items-center rounded-lg border border-border bg-card px-4 py-3 font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 lg:flex sm:min-h-8">
        結果表を表示
      </summary>
      <div className="mt-3">{resultsTable}</div>
    </details>
  ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 xl:px-8 2xl:px-12">
      <div className="flex items-start justify-between gap-3 text-sm">
        <Link href={listHref} className="inline-flex min-h-11 shrink-0 items-center rounded-sm text-flag underline outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-8">← 大会一覧</Link>
        <span className="min-w-0 flex-1 break-words text-right text-muted-foreground sm:truncate">{meet.meetName}</span>
      </div>
      <Field orientation="responsive">
        <FieldLabel htmlFor="category-select">カテゴリー</FieldLabel>
        <Select
          items={categories.map((category) => ({
            label: category.name || category.raceId,
            value: category.raceId,
          }))}
          value={selectedCategory.raceId}
          onValueChange={(value) => changeCategory(String(value))}
        >
          <SelectTrigger
            id="category-select"
            data-race-category-trigger
            aria-describedby="category-select-description"
            className="min-h-11 min-w-0 flex-1 sm:min-h-8"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category) => <SelectItem key={category.raceId} value={category.raceId}>{category.name || category.raceId}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription id="category-select-description">この大会のカテゴリーを選択します。</FieldDescription>
      </Field>
      <RaceHeader race={race} />
      {resultsPresentation === "full" ? resultsTable : null}

      {race.riders.length > 0 ? (
      <div className="flex min-w-0 flex-col gap-4">
        <section
          id={ANALYSIS_REGION_ID}
          data-race-analysis-region
          tabIndex={-1}
          aria-labelledby="race-analysis-heading"
          className={`flex flex-col gap-4 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${isAnalysisState ? "order-2 lg:order-1" : ""} lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:items-start lg:gap-6`}
        >
          <h2 id="race-analysis-heading" tabIndex={-1} className="sr-only lg:col-span-2">
            周回分析
          </h2>
          {isAnalysisState && selfRider ? (
            <div className="min-w-0 lg:col-span-2">
              <AnalysisContextBar
                raceName={race.raceName}
                categoryName={race.category}
                riderName={selfRider.name}
                riderStatus={getAnalysisRiderStatus(selfRider, riderResult)}
                comparisonMode={getAnalysisComparisonLabel(comparisonMode)}
                displayedCount={comparisonRiders.length}
                activeMetric={getAnalysisMetricLabel(currentViewState.activeTab)}
              />
            </div>
          ) : null}
          {analysisPresentationOrder.mainBeforeRail ? (
            <>
              {analysisMain}
              {analysisRail}
            </>
          ) : (
            <>
              {analysisRail}
              {analysisMain}
            </>
          )}
        </section>
        {resultsPresentation === "desktop-disclosure" ? activeResultsDisclosure : null}
      </div>
      ) : null}
    </div>
  );
}
