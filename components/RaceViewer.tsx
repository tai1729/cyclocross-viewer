"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRaceData } from "@/hooks/useRaceData";
import { DATA_BASE_URL } from "@/hooks/useMeetData";
import {
  useComparisonRiders,
  type ComparisonMode,
} from "@/hooks/useComparisonRiders";
import { getRiderById, getRiderSummary } from "@/lib/dataTransform";
import { buildRiderColorMap } from "@/lib/chartColors";
import type { MeetEntry } from "@/lib/types";
import { RaceHeader } from "@/components/RaceHeader";
import { RiderSelector } from "@/components/RiderSelector";
import { SummaryCard } from "@/components/SummaryCard";
import { ComparisonAdjuster } from "@/components/ComparisonAdjuster";
import { ChartTabs } from "@/components/ChartTabs";

interface RaceViewerProps {
  meet: MeetEntry;
}

export function RaceViewer({ meet }: RaceViewerProps) {
  const categories = useMemo(
    () => [...meet.categories].sort((a, b) => a.order - b.order),
    [meet.categories],
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.raceId ?? "");
  const selectedCategory = categories.find((category) => category.raceId === categoryId) ?? categories[0];
  const { race, isLoading, error } = useRaceData(
    selectedCategory ? `${DATA_BASE_URL}/data/race-${selectedCategory.raceId}.json` : undefined,
  );
  const [selfRiderId, setSelfRiderId] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>(2);

  const validRiders = useMemo(
    () => race?.riders.filter((rider) => rider.dataQuality === "ok") ?? [],
    [race],
  );
  const graphableRiders = useMemo(
    () => validRiders.filter((rider) => rider.laps.length > 0),
    [validRiders],
  );
  const comparisonRiders = useComparisonRiders(graphableRiders, selfRiderId, comparisonMode);
  const colors = useMemo(() => (race ? buildRiderColorMap(race) : {}), [race]);

  function changeCategory(value: string) {
    setCategoryId(value);
    setSelfRiderId(null);
  }

  if (!selectedCategory) {
    return <div className="p-4 text-center text-red-600">この大会にはカテゴリーがありません。</div>;
  }

  if (isLoading) return <div className="p-4 text-center text-ink/50">リザルトを読み込み中…</div>;
  if (error || !race) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 p-4 text-center">
        <p className="text-red-600">{meet.meetName} / {selectedCategory.name || "選択カテゴリー"} の取得に失敗しました。</p>
        <Link href={`/race/${encodeURIComponent(meet.meetId)}`} className="text-sm text-flag underline">再試行</Link>
      </div>
    );
  }

  const selfRider = selfRiderId ? getRiderById(race, selfRiderId) : undefined;
  const hasValidData = selfRider?.dataQuality === "ok";
  const hasLapData = (selfRider?.laps.length ?? 0) > 0;
  const summary = selfRiderId && hasValidData && hasLapData
    ? getRiderSummary(race, selfRiderId)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 p-3 sm:max-w-2xl sm:p-4 lg:max-w-6xl">
      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/" className="text-flag underline">← 大会一覧</Link>
        <span className="truncate text-right text-ink/55">{meet.meetName}</span>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        カテゴリー
        <select value={selectedCategory.raceId} onChange={(event) => changeCategory(event.target.value)} className="min-w-0 flex-1 rounded-md border border-paper-line bg-white px-3 py-2 font-normal focus:border-flag focus:outline-none">
          {categories.map((category) => <option key={category.raceId} value={category.raceId}>{category.name || category.raceId}</option>)}
        </select>
      </label>
      <RaceHeader race={race} />

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[360px_1fr] lg:items-start lg:gap-4">
        <div className="flex flex-col gap-3">
          <RiderSelector riders={race.riders} selectedRiderId={selfRiderId} onSelect={setSelfRiderId} />
          {summary && (
            <>
              <SummaryCard summary={summary} />
              <ComparisonAdjuster mode={comparisonMode} onChange={setComparisonMode} />
            </>
          )}
        </div>
        {selfRider && !hasValidData ? (
          <div className="rounded-lg border border-dashed border-paper-line p-4 text-center text-sm text-ink/55">
            この選手の周回データには異常があるため、グラフを表示できません。
          </div>
        ) : selfRider && !hasLapData ? (
          <div className="rounded-lg border border-dashed border-paper-line p-4 text-center text-sm text-ink/55">
            この選手には周回データがないため、グラフを表示できません。
          </div>
        ) : summary && selfRider ? (
          <ChartTabs race={race} selfRider={selfRider} comparisonRiders={comparisonRiders} colors={colors} />
        ) : (
          <div className="rounded-lg border border-dashed border-paper-line p-4 text-center text-sm text-ink/45">選手を選択してください</div>
        )}
      </div>
    </div>
  );
}
