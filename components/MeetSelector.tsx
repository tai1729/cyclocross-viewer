"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MeetEntry } from "@/lib/types";

interface MeetSelectorProps {
  meets: MeetEntry[];
}

export function MeetSelector({ meets }: MeetSelectorProps) {
  const seasons = useMemo(() => [...new Set(meets.map((meet) => meet.season))].sort().reverse(), [meets]);
  const [season, setSeason] = useState("");
  const [series, setSeries] = useState("");

  const filteredBySeason = season ? meets.filter((meet) => meet.season === season) : meets;
  const seriesOptions = useMemo(
    () => [...new Set(filteredBySeason.map((meet) => meet.series).filter(Boolean))].sort(),
    [filteredBySeason],
  );
  const filtered = filteredBySeason
    .filter((meet) => !series || meet.series === series)
    .sort((a, b) => b.meetDate.localeCompare(a.meetDate));

  function changeSeason(value: string) {
    setSeason(value);
    setSeries("");
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-flag">AJOCC results</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">大会を選ぶ</h1>
        <p className="mt-1 text-sm text-ink/55">シーズンとシリーズから大会を絞り込めます。</p>
      </div>

      <div className="grid gap-3 rounded-lg border border-paper-line bg-white p-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          シーズン
          <select value={season} onChange={(event) => changeSeason(event.target.value)} className="rounded-md border border-paper-line bg-paper px-3 py-2 font-normal focus:border-flag focus:outline-none">
            <option value="">すべてのシーズン</option>
            {seasons.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          シリーズ
          <select value={series} onChange={(event) => setSeries(event.target.value)} className="rounded-md border border-paper-line bg-paper px-3 py-2 font-normal focus:border-flag focus:outline-none">
            <option value="">すべてのシリーズ</option>
            {seriesOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-paper-line bg-white">
        <div className="border-b border-paper-line px-3 py-2 text-sm text-ink/55">{filtered.length}大会</div>
        {filtered.length > 0 ? (
          <div className="divide-y divide-paper-line">
            {filtered.map((meet) => (
              <Link key={meet.meetId} href={`/race/${encodeURIComponent(meet.meetId)}`} className="grid grid-cols-[6.5rem_5rem_1fr] gap-2 px-3 py-3 text-sm transition-colors hover:bg-flag-soft focus:bg-flag-soft focus:outline-none sm:grid-cols-[8rem_7rem_1fr]">
                <time dateTime={meet.meetDate} className="font-mono text-ink/65">{meet.meetDate}</time>
                <span className="text-flag">{meet.series || "—"}</span>
                <span className="min-w-0 truncate font-medium text-ink">{meet.meetName}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-3 py-8 text-center text-sm text-ink/50">条件に一致する大会がありません。</p>
        )}
      </div>
    </section>
  );
}
