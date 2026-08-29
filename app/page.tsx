"use client";

import { useMemo, useState } from "react";
import { useRaceData } from "@/hooks/useRaceData";
import { useComparisonRiders } from "@/hooks/useComparisonRiders";
import { getRiderById, getRiderSummary } from "@/lib/dataTransform";
import { buildRiderColorMap } from "@/lib/chartColors";
import { RaceHeader } from "@/components/RaceHeader";
import { RiderSelector } from "@/components/RiderSelector";
import { SummaryCard } from "@/components/SummaryCard";
import { ChartTabs } from "@/components/ChartTabs";

export default function Home() {
  const { race, isLoading, error } = useRaceData();
  const [selfRiderId, setSelfRiderId] = useState<string | null>(null);

  // dataQualityが異常な選手はMVP-0では単純に比較対象・選択肢から除外する
  const validRiders = useMemo(
    () => race?.riders.filter((r) => r.dataQuality === "ok") ?? [],
    [race],
  );

  const comparisonRiders = useComparisonRiders(validRiders, selfRiderId);
  const colors = useMemo(() => (race ? buildRiderColorMap(race) : {}), [race]);

  if (isLoading) {
    return <div className="p-4 text-center text-zinc-500">読み込み中...</div>;
  }
  if (error || !race) {
    return (
      <div className="p-4 text-center text-red-600">
        データの取得に失敗しました: {error}
      </div>
    );
  }

  const selfRider = selfRiderId ? getRiderById(race, selfRiderId) : undefined;
  const summary = selfRiderId ? getRiderSummary(race, selfRiderId) : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 p-3 sm:max-w-2xl sm:p-4">
      <RaceHeader race={race} />

      <RiderSelector
        riders={validRiders}
        selectedRiderId={selfRiderId}
        onSelect={setSelfRiderId}
      />

      {summary && selfRider ? (
        <>
          <SummaryCard summary={summary} />
          <ChartTabs
            race={race}
            selfRider={selfRider}
            comparisonRiders={comparisonRiders}
            colors={colors}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
          選手を選択してください
        </div>
      )}
    </div>
  );
}
