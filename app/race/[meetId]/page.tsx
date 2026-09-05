import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RaceViewer } from "@/components/RaceViewer";
import { fetchMeetById } from "@/lib/dataSource";

interface RacePageProps {
  params: Promise<{ meetId: string }>;
}

export default async function RacePage({ params }: RacePageProps) {
  const { meetId } = await params;
  const meet = await fetchMeetById(meetId);
  if (!meet) notFound();

  return (
    <Suspense fallback={<div className="p-4 text-center text-muted-foreground" role="status">リザルトを読み込み中…</div>}>
      <RaceViewer meet={meet} />
    </Suspense>
  );
}
