"use client";

import { MeetSelector } from "@/components/MeetSelector";
import { useMeetData } from "@/hooks/useMeetData";

export default function Home() {
  const { meets, isLoading, error } = useMeetData();

  if (isLoading) return <div className="p-4 text-center text-ink/50">大会一覧を読み込み中…</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return <main className="mx-auto w-full max-w-4xl p-3 sm:p-4"><MeetSelector meets={meets} /></main>;
}
