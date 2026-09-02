"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MeetEntry } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const seasonItems = [
    { label: "すべてのシーズン", value: null },
    ...seasons.map((value) => ({ label: value, value })),
  ];
  const seriesItems = [
    { label: "すべてのシリーズ", value: null },
    ...seriesOptions.map((value) => ({ label: value, value })),
  ];

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

      <Card size="sm">
        <CardContent>
          <FieldGroup className="sm:flex-row">
            <Field>
              <FieldLabel>シーズン</FieldLabel>
              <Select items={seasonItems} value={season || null} onValueChange={(value) => changeSeason(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value={null}>すべてのシーズン</SelectItem>{seasons.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>シリーズ</FieldLabel>
              <Select items={seriesItems} value={series || null} onValueChange={(value) => setSeries(value ?? "")}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value={null}>すべてのシリーズ</SelectItem>{seriesOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b"><span className="text-sm text-muted-foreground">{filtered.length}大会</span></CardHeader>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto overscroll-x-contain">
            <div className="min-w-[42rem] divide-y divide-paper-line sm:min-w-0">
              {filtered.map((meet) => (
                <Link key={meet.meetId} href={`/race/${encodeURIComponent(meet.meetId)}`} className="grid min-w-full grid-cols-[6.5rem_5rem_max-content] gap-2 px-3 py-3 text-sm transition-colors hover:bg-flag-soft focus:bg-flag-soft focus:outline-none sm:grid-cols-[8rem_7rem_minmax(0,1fr)]">
                  <time dateTime={meet.meetDate} className="font-mono text-ink/65">{meet.meetDate}</time>
                  <span className="text-flag">{meet.series || "—"}</span>
                  <span className="whitespace-nowrap font-medium text-ink sm:min-w-0 sm:truncate">{meet.meetName}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">条件に一致する大会がありません。</p>
        )}
      </Card>
    </section>
  );
}
