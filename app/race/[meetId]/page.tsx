"use client";

import { useParams } from "next/navigation";
import { RaceViewer } from "@/components/RaceViewer";
import { useMeetData } from "@/hooks/useMeetData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function RacePage() {
  const params = useParams<{ meetId: string }>();
  const { meets, isLoading, error } = useMeetData();
  const meet = meets.find((entry) => entry.meetId === params.meetId);

  if (isLoading) return <main className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 xl:px-8 2xl:px-12"><Skeleton className="h-8 w-64" /><Skeleton className="h-12 w-full" /><Skeleton className="h-96 w-full" /></main>;
  if (error || !meet) {
    return <main className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-6 sm:py-4 xl:px-8"><Alert variant="destructive"><AlertTitle>大会情報を取得できませんでした</AlertTitle><AlertDescription>時間をおいて再度お試しください。</AlertDescription></Alert></main>;
  }

  return <RaceViewer meet={meet} />;
}
