"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  countUnicodeCodePoints,
  normalizeRiderDiscoveryQuery,
  type RiderDiscoveryAppearance,
  type RiderDiscoveryMatch,
  type RiderDiscoveryResponse,
} from "@/lib/riderDiscovery";
import { serializeRaceUrlState } from "@/lib/urlState";

type DiscoveryState = "idle" | "loading" | "complete" | "partial" | "empty" | "retryable" | "fatal";

function appearanceHref(match: RiderDiscoveryMatch, appearance: RiderDiscoveryAppearance): string {
  const query = serializeRaceUrlState({
    season: appearance.season,
    series: appearance.series,
    category: appearance.categoryId,
    rider: match.riderId,
    compare: 2,
    fixed: [],
    tab: "rank",
    lap: null,
    unknownParams: [],
  });
  return `/race/${encodeURIComponent(appearance.meetId)}?${query}`;
}

function isResponse(value: unknown): value is RiderDiscoveryResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (candidate.status === "complete" || candidate.status === "partial") &&
    typeof candidate.query === "string" &&
    Array.isArray(candidate.results) &&
    typeof candidate.scannedSources === "number" &&
    typeof candidate.failedSources === "number" &&
    typeof candidate.totalSources === "number";
}

export function RiderDiscovery() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<DiscoveryState>("idle");
  const [response, setResponse] = useState<RiderDiscoveryResponse | null>(null);

  async function search(): Promise<void> {
    const normalized = normalizeRiderDiscoveryQuery(query);
    if (countUnicodeCodePoints(normalized) < 2) {
      setResponse(null);
      setState("fatal");
      return;
    }
    setState("loading");
    setResponse(null);
    try {
      const result = await fetch(`/api/riders/search?q=${encodeURIComponent(query)}`);
      const body: unknown = await result.json().catch(() => null);
      if (!result.ok) {
        setState(result.status === 503 ? "retryable" : "fatal");
        return;
      }
      if (!isResponse(body)) {
        setState("fatal");
        return;
      }
      setResponse(body);
      setState(body.status === "partial" ? "partial" : body.results.length ? "complete" : "empty");
    } catch {
      setState("retryable");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void search();
  }

  return (
    <Card data-rider-discovery-state={state} className="min-w-0">
      <CardHeader className="border-b">
        <CardTitle>選手から探す</CardTitle>
        <CardDescription>大会やカテゴリーをまたいで、選手名または選手IDから探します。</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="rider-discovery-query">選手名または選手ID</FieldLabel>
            <input id="rider-discovery-query" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="2文字以上" className="min-h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" disabled={state === "loading"} />
            <FieldDescription>空白や大文字小文字を整えて検索します。</FieldDescription>
          </Field>
          <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={state === "loading"}>{state === "loading" ? "検索中…" : "検索"}</Button>
        </form>
        <div aria-live="polite" className="mt-4 min-w-0">
          {state === "idle" && <p data-discovery-status="idle" className="text-sm text-muted-foreground">検索語を入力して検索してください。</p>}
          {state === "loading" && <p data-discovery-status="loading" className="text-sm text-muted-foreground">選手データを確認しています…</p>}
          {state === "fatal" && <Alert variant="destructive" data-discovery-status="fatal"><AlertTitle>検索できません</AlertTitle><AlertDescription>検索語は2文字以上で入力するか、検索条件を確認してください。</AlertDescription></Alert>}
          {state === "retryable" && <Alert variant="destructive" data-discovery-status="retryable"><AlertTitle>検索を完了できません</AlertTitle><AlertDescription className="flex flex-col items-start gap-3"><span>選手データを取得できませんでした。再試行してください。</span><Button type="button" variant="outline" className="min-h-11" onClick={() => void search()}>再試行</Button></AlertDescription></Alert>}
          {state === "partial" && response && <div data-discovery-status="partial" className="flex min-w-0 flex-col gap-3"><Alert><AlertTitle>一部のデータで検索しました</AlertTitle><AlertDescription className="flex flex-col items-start gap-3"><span>確認できないデータがあるため、結果は不完全です。選手が存在しないとは限りません。</span><Button type="button" variant="outline" className="min-h-11" onClick={() => void search()}>再試行</Button></AlertDescription></Alert>{response.results.length ? <DiscoveryResults response={response} /> : <p className="text-sm text-muted-foreground">一致する選手は確認できたデータにはありませんでした。</p>}</div>}
          {state === "complete" && response && <div data-discovery-status="complete"><p className="text-sm text-muted-foreground">検索完了: {response.results.length}件</p><DiscoveryResults response={response} /></div>}
          {state === "empty" && <p data-discovery-status="empty" className="text-sm text-muted-foreground">一致する選手が見つかりませんでした。検索条件を変えてお試しください。</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function DiscoveryResults({ response }: { response: RiderDiscoveryResponse }) {
  return <div className="mt-3 grid min-w-0 gap-3">{response.results.map((match) => <article key={match.riderId} className="min-w-0 rounded-lg border border-paper-line p-3"><h3 className="break-words font-medium text-ink">{match.name || "名前未登録"}</h3><p className="break-all font-mono text-xs text-muted-foreground">{match.riderId}</p><p className="mt-1 text-xs text-muted-foreground">{match.totalAppearances}回の出場{match.dataQuality === "error" ? "・分析データは利用できない場合があります" : ""}</p><div className="mt-3 grid min-w-0 gap-2">{match.appearances.map((appearance) => <Link key={`${appearance.meetId}-${appearance.categoryId}`} href={appearanceHref(match, appearance)} className="flex min-h-11 min-w-0 flex-col justify-center rounded-md border border-paper-line px-3 py-2 text-sm hover:bg-flag-soft focus-visible:bg-flag-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"><span className="break-words font-medium text-ink">{appearance.meetName}</span><span className="break-words text-xs text-muted-foreground">{appearance.meetDate} · {appearance.categoryName} · {appearance.season}{appearance.series ? ` · ${appearance.series}` : ""}</span></Link>)}</div></article>)}</div>;
}
