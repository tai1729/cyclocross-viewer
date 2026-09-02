"use client";

import { MeetSelector } from "@/components/MeetSelector";
import { useMeetData } from "@/hooks/useMeetData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { meets, isLoading, error } = useMeetData();

  if (isLoading) return <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 xl:px-8"><Skeleton className="h-8 w-48" /><Skeleton className="h-28 w-full" /><Skeleton className="h-80 w-full" /></main>;
  if (error) return <main className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-6 sm:py-4 xl:px-8"><Alert variant="destructive"><AlertTitle>大会一覧を取得できませんでした</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></main>;

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-6 sm:py-4 xl:px-8"><MeetSelector meets={meets} /></main>;
}
