"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { MeetEntry } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  normalizeHomeUrlState,
  parseHomeUrlState,
  serializeHomeUrlState,
  updateHomeUrlQuery,
} from "@/lib/urlState";

interface MeetSelectorProps {
  meets: MeetEntry[];
}

export function MeetSelector({ meets }: MeetSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasons = useMemo(() => [...new Set(meets.map((meet) => meet.season))].sort().reverse(), [meets]);
  const urlState = useMemo(() => parseHomeUrlState(searchParams), [searchParams]);
  const normalizedUrlState = useMemo(() => normalizeHomeUrlState(urlState, meets), [meets, urlState]);
  const season = normalizedUrlState.season;
  const series = normalizedUrlState.series;
  const canonicalQuery = useMemo(() => serializeHomeUrlState(normalizedUrlState), [normalizedUrlState]);
  const contextQuery = useMemo(
    () => serializeHomeUrlState({ season, series, unknownParams: [] }),
    [season, series],
  );

  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (currentQuery !== canonicalQuery) {
      void router.replace(canonicalQuery ? `/?${canonicalQuery}` : "/");
    }
  }, [canonicalQuery, router, searchParams]);

  const filteredBySeason = season ? meets.filter((meet) => meet.season === season) : meets;
  const seriesOptions = useMemo(
    () => [...new Set(filteredBySeason.map((meet) => meet.series).filter(Boolean))].sort(),
    [filteredBySeason],
  );
  const filtered = filteredBySeason
    .filter((meet) => !series || meet.series === series)
    .sort((a, b) => b.meetDate.localeCompare(a.meetDate));
  const seasonItems = [
    { label: "すべてのシーズン", value: null },
    ...seasons.map((value) => ({ label: value, value })),
  ];
  const seriesItems = [
    { label: "すべてのシリーズ", value: null },
    ...seriesOptions.map((value) => ({ label: value, value })),
  ];

  function pushUrl(patch: { season?: string; series?: string }) {
    const currentQuery = searchParams.toString();
    const nextQuery = updateHomeUrlQuery(searchParams, {
      season: patch.season ?? season,
      series: patch.series ?? series,
    });
    if (nextQuery === currentQuery) return;
    void router.push(nextQuery ? `/?${nextQuery}` : "/");
  }

  function changeSeason(value: string) {
    pushUrl({ season: value, series: "" });
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-flag">AJOCC results</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">大会を選ぶ</h1>
        <p className="mt-1 text-sm text-muted-foreground">シーズンとシリーズから大会を絞り込めます。</p>
      </div>

      <Card size="sm">
        <CardContent>
          <FieldGroup className="sm:flex-row">
            <Field>
              <FieldLabel htmlFor="season-filter">シーズン</FieldLabel>
              <Select items={seasonItems} value={season || null} onValueChange={(value) => changeSeason(value ?? "")}>
                <SelectTrigger id="season-filter" aria-describedby="season-filter-description" className="min-h-11 w-full sm:min-h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value={null}>すべてのシーズン</SelectItem>{seasons.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <FieldDescription id="season-filter-description">大会のシーズンを絞り込みます。</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="series-filter">シリーズ</FieldLabel>
              <Select items={seriesItems} value={series || null} onValueChange={(value) => pushUrl({ series: value ?? "" })}>
                <SelectTrigger id="series-filter" aria-describedby="series-filter-description" className="min-h-11 w-full sm:min-h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value={null}>すべてのシリーズ</SelectItem>{seriesOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <FieldDescription id="series-filter-description">選択中シーズン内のシリーズを絞り込みます。</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b"><span className="text-sm text-muted-foreground">{filtered.length}大会</span></CardHeader>
        {filtered.length > 0 ? (
          <div className="divide-y divide-paper-line">
              {filtered.map((meet) => (
                <Link key={meet.meetId} href={`/race/${encodeURIComponent(meet.meetId)}${contextQuery ? `?${contextQuery}` : ""}`} className="flex min-w-0 flex-col gap-1 px-3 py-3 text-sm transition-colors hover:bg-flag-soft focus-visible:bg-flag-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring sm:grid sm:grid-cols-[8rem_7rem_minmax(0,1fr)] sm:gap-2">
                  <span className="flex min-w-0 items-center gap-3 sm:contents">
                    <time dateTime={meet.meetDate} className="font-mono text-muted-foreground">{meet.meetDate}</time>
                    <span className="text-flag">{meet.series || "—"}</span>
                  </span>
                  <span className="min-w-0 break-words font-medium text-ink sm:truncate">{meet.meetName}</span>
                </Link>
              ))}
          </div>
        ) : (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">条件に一致する大会がありません。</p>
        )}
      </Card>
    </section>
  );
}
