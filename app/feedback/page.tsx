import Link from "next/link";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function FeedbackPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-3">
        <Link href="/" className="inline-flex min-h-11 w-fit items-center rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 outline-none hover:bg-muted hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
          AJOCCラップタイムビューアに戻る
        </Link>
        <p className="text-sm font-medium text-muted-foreground">AJOCCラップタイムビューア</p>
        <h1 className="text-3xl font-semibold tracking-tight">ご意見・不具合を送る</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          使いにくかった点、表示やデータの問題、欲しい機能を教えてください。匿名で送信でき、表示中の画面状態は問題の確認に必要な範囲だけ自動で添えられます。
        </p>
      </header>
      <FeedbackForm />
    </main>
  );
}
