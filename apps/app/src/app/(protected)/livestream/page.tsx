import { redirect } from 'next/navigation';

export default async function LegacyLivestreamPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  redirect(date ? `/livestreams/${encodeURIComponent(date)}` : '/livestreams');
}
