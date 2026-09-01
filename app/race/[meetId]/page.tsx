"use client";

import { useParams } from "next/navigation";
import { RaceViewer } from "@/components/RaceViewer";
import { useMeetData } from "@/hooks/useMeetData";

export default function RacePage() {
  const params = useParams<{ meetId: string }>();
  const { meets, isLoading, error } = useMeetData();
  const meet = meets.find((entry) => entry.meetId === params.meetId);

  if (isLoading) return <div className="p-4 text-center text-ink/50">大会情報を読み込み中…</div>;
  if (error || !meet) {
    return <div className="p-4 text-center text-red-600">大会情報を取得できませんでした。</div>;
  }

  return <RaceViewer meet={meet} />;
}
