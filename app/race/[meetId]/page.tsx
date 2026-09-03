import { notFound } from "next/navigation";
import { RaceViewer } from "@/components/RaceViewer";
import { fetchMeetById } from "@/lib/dataSource";

interface RacePageProps {
  params: Promise<{ meetId: string }>;
}

export default async function RacePage({ params }: RacePageProps) {
  const { meetId } = await params;
  const meet = await fetchMeetById(meetId);
  if (!meet) notFound();

  return <RaceViewer meet={meet} />;
}
