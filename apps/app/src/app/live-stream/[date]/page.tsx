import { redirect } from 'next/navigation';

export default async function LiveStreamDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(`/livestreams/${encodeURIComponent(date)}`);
}
