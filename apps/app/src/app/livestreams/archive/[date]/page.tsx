import { redirect } from 'next/navigation';
import { resolveStreamPathForDate } from '@/lib/livestreams-routing';

export default async function LegacyLivestreamArchivePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const canonicalPath = await resolveStreamPathForDate(date);
  redirect(`${canonicalPath}/talking-points`);
}
