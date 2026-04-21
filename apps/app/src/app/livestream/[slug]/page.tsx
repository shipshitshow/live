import { redirect } from 'next/navigation';

export default async function LegacyLivestreamTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const { date } = await searchParams;
  const pathname = `/livestreams/${encodeURIComponent(slug)}`;

  redirect(date ? `${pathname}?date=${encodeURIComponent(date)}` : pathname);
}
