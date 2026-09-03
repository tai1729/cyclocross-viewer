import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Alert>
        <AlertTitle>大会が見つかりませんでした</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>指定された大会は一覧に存在しません。</span>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-3 font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            大会一覧へ戻る
          </Link>
        </AlertDescription>
      </Alert>
    </main>
  );
}
