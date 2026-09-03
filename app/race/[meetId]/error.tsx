"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RaceRouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function RaceRouteError({ retry }: RaceRouteErrorProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Alert variant="destructive">
        <AlertTitle>大会情報を取得できませんでした</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>
            通信またはデータ形式に問題があります。時間をおいて再試行してください。
          </span>
          <span className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => startTransition(retry)}
              disabled={isPending}
              className="min-h-11"
            >
              {isPending ? "再試行中…" : "再試行"}
            </Button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-3 font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              大会一覧へ戻る
            </Link>
          </span>
          <span className="sr-only" aria-live="polite">
            {isPending ? "大会情報を再取得しています" : ""}
          </span>
        </AlertDescription>
      </Alert>
    </main>
  );
}
