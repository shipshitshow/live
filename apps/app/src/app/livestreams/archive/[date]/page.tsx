import { redirect } from 'next/navigation';

export default async function LegacyLivestreamArchivePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/livestreams/${encodeURIComponent(date)}?tab=talking-points`);
}
