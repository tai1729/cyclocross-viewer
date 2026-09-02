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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    return <Alert variant="destructive"><AlertTitle>カテゴリーがありません</AlertTitle><AlertDescription>この大会にはカテゴリー情報がありません。</AlertDescription></Alert>;
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
    <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 xl:px-8 2xl:px-12">
      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/" className="text-flag underline">← 大会一覧</Link>
        <span className="truncate text-right text-ink/55">{meet.meetName}</span>
      </div>
      <Field orientation="responsive">
        <FieldLabel>カテゴリー</FieldLabel>
        <Select
          items={categories.map((category) => ({
            label: category.name || category.raceId,
            value: category.raceId,
          }))}
          value={selectedCategory.raceId}
          onValueChange={(value) => changeCategory(String(value))}
        >
          <SelectTrigger className="min-w-0 flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category) => <SelectItem key={category.raceId} value={category.raceId}>{category.name || category.raceId}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <RaceHeader race={race} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
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
          <Alert><AlertTitle>グラフを表示できません</AlertTitle><AlertDescription>この選手の周回データには異常があります。</AlertDescription></Alert>
        ) : selfRider && !hasLapData ? (
          <Alert><AlertTitle>周回データがありません</AlertTitle><AlertDescription>この選手にはグラフ表示に必要な周回データがありません。</AlertDescription></Alert>
        ) : summary && selfRider ? (
          <ChartTabs race={race} selfRider={selfRider} comparisonRiders={comparisonRiders} colors={colors} />
        ) : (
          <Alert><AlertTitle>選手を選択してください</AlertTitle><AlertDescription>選手を選ぶと周回データを比較できます。</AlertDescription></Alert>
        )}
      </div>
    </div>
  );
}
