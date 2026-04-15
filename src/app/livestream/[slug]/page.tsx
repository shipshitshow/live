import type { Metadata } from 'next';
import { TopicDetailClient } from '@/components/livestream/TopicDetailClient';
import { todayLocalDate } from '@/lib/date';
import { getTopicBySlug, resolveLivestreamDate } from '@/lib/livestream-store';
import {
  buildYouTubeThumbnailUrl,
  extractVideoId,
  extractYouTubeUrl,
} from '@/lib/livestream-youtube';
import { buildDefaultMetadata, toAbsoluteUrl } from '@/lib/site';
import { clampText, stripMarkdown } from '@/lib/text';

function extractSummary(content: string): string | null {
  const match = content.match(/## Summary\n([\s\S]*?)(?:\n## |\n?$)/);
  if (!match) return null;

  const summary = stripMarkdown(match[1]).trim();
  return summary.length > 0 ? summary : null;
}

function buildTopicImageUrl(
  slug: string,
  date: string,
  content: string,
): string {
  const youtubeUrl = extractYouTubeUrl(content);
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  if (videoId) {
    return buildYouTubeThumbnailUrl(videoId);
  }

  return toAbsoluteUrl(
    `/api/og/livestream/${encodeURIComponent(slug)}?date=${encodeURIComponent(date)}`,
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { date } = await searchParams;
  const requestedDate = date || todayLocalDate();
  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const topic = await getTopicBySlug(resolvedDate, slug);
  const defaults = buildDefaultMetadata();

  if (!topic) {
    return {
      ...defaults,
      description: 'Livestream topic and show prep for Ship Shit Show.',
      title: 'Ship Shit Show — Livestream Topic',
    };
  }

  const summary =
    extractSummary(topic.content) ||
    'Livestream topic and show prep for Ship Shit Show.';
  const description = clampText(summary, 220);
  const imageUrl = buildTopicImageUrl(topic.slug, resolvedDate, topic.content);
  const pageUrl = toAbsoluteUrl(
    `/livestream/${encodeURIComponent(topic.slug)}?date=${encodeURIComponent(resolvedDate)}`,
  );
  const pageTitle = `${topic.title} — Ship Shit Show`;

  return {
    ...defaults,
    alternates: {
      canonical: pageUrl,
    },
    description,
    openGraph: {
      ...defaults.openGraph,
      description,
      images: [
        {
          alt: topic.title,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      title: pageTitle,
      type: 'article',
      url: pageUrl,
    },
    title: pageTitle,
    twitter: {
      ...defaults.twitter,
      description,
      images: [imageUrl],
      title: pageTitle,
    },
  };
}

export default function TopicDetailPage() {
  return <TopicDetailClient />;
}
