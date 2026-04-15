'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { LivestreamTopicContentSkeleton } from '@/components/PageSkeletons';
import { isErrorResponse } from '@/lib/api-types';
import { logClientEvent, logClientPerf } from '@/lib/client-logger';
import { todayLocalDate } from '@/lib/date';
import { parseJsonResponse } from '@/lib/parse-json-response';
import type { LivestreamListResponse, Topic } from '@/lib/livestream-types';
import type { TrendItem, TrendsSearchResponse } from '@/lib/trends-types';

const SOURCE_COLORS: Record<string, string> = {
  GitHub: 'bg-purple-500/20 text-purple-400',
  HN: 'bg-orange-500/20 text-orange-400',
  Reddit: 'bg-orange-600/20 text-orange-300',
  X: 'bg-blue-400/20 text-blue-400',
  YouTube: 'bg-red-500/20 text-red-400',
};

const STATUS_BADGES: Record<string, string> = {
  backlog: 'bg-surface-border text-text-muted',
  done: 'bg-green-500/10 text-green-400',
  in_progress: 'bg-accent-red/10 text-accent-red',
};

interface ParsedSection {
  heading: string;
  body: string;
}

interface MarkdownLink {
  text: string;
  url: string;
}

interface LivestreamMeta {
  youtubeUrl: string | null;
  videoId?: string;
  title?: string | null;
  channelTitle?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  viewCount?: number;
  concurrentViewers?: number | null;
  scheduledStartTime?: string | null;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  liveStatus:
    | 'live'
    | 'ended'
    | 'scheduled'
    | 'missing'
    | 'invalid'
    | 'unauthorized'
    | 'error';
}

function parseMarkdownSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split('\n');
  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentHeading) {
        sections.push({
          body: currentBody.join('\n').trim(),
          heading: currentHeading,
        });
      }
      currentHeading = line.slice(3);
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({
      body: currentBody.join('\n').trim(),
      heading: currentHeading,
    });
  }
  return sections;
}

function isTalkingPointSection(heading: string): boolean {
  return heading.toLowerCase().includes('talking point');
}

function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function renderInlineLinks(text: string) {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, j) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a
          key={j}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-red hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={j}>{part}</span>;
  });
}

function stripSourcePrefix(text: string): string {
  return text.replace(/^TWEET:\s*/i, '').replace(/^Source:\s*/i, '');
}

function extractMarkdownLinks(text: string): MarkdownLink[] {
  return Array.from(text.matchAll(/\[(.*?)\]\((.*?)\)/g)).map((match) => ({
    text: match[1],
    url: match[2],
  }));
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*-\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampText(text: string, maxLength = 180): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function isTweetUrl(url: string): boolean {
  return /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url);
}

function isRestreamUrl(url: string): boolean {
  return /studio\.restream\.io/i.test(url);
}

const TOPIC_QUERY_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'but',
  'does',
  'for',
  'from',
  'into',
  'is',
  'it',
  'matter',
  'real',
  'still',
  'that',
  'the',
  'this',
  'with',
]);

function buildTopicSearchQuery(title: string, summary?: string): string {
  const words = `${title} ${summary ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TOPIC_QUERY_STOP_WORDS.has(word));

  const uniqueWords = Array.from(new Set(words)).slice(0, 6);
  if (uniqueWords.length === 0) return title;
  if (!uniqueWords.includes('ai')) uniqueWords.unshift('ai');
  return uniqueWords.join(' ');
}

// Parse a section body into structured talking points with inline sources
interface TalkingPoint {
  text: string;
  sources: { text: string; url: string }[];
}

function parseTalkingPoints(body: string): TalkingPoint[] {
  const lines = body.split('\n');
  const points: TalkingPoint[] = [];
  let current: TalkingPoint | null = null;

  for (const line of lines) {
    if (line.startsWith('- ') && !line.startsWith('  - ')) {
      // Top-level bullet = new talking point
      if (current) points.push(current);
      current = { sources: [], text: line.slice(2) };
    } else if (line.startsWith('  - ') && current) {
      // Indented bullet = source link
      const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        current.sources.push({ text: linkMatch[1], url: linkMatch[2] });
      }
    }
  }
  if (current) points.push(current);
  return points;
}

// Build show rundown
interface ShowSegment {
  number: number;
  label: string;
  time: string;
  duration: string;
  points: TalkingPoint[];
  rawText?: string;
  type: 'intro' | 'segment' | 'hottake' | 'conclusion';
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatSegmentTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatSegmentDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }
  if (seconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${seconds} sec`;
}

function clampSeconds(
  value: number,
  minSeconds: number,
  maxSeconds: number,
): number {
  return Math.max(minSeconds, Math.min(maxSeconds, Math.round(value)));
}

function buildColdOpenHook(summary?: ParsedSection): string {
  if (!summary?.body) return "Let's get into it.";

  const firstSentence = summary.body
    .split(/(?<=[.!?])\s+/)
    .find((sentence) => sentence.trim().length > 0);
  if (!firstSentence) return "Let's get into it.";

  const words = firstSentence.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 18) return firstSentence.trim();
  return `${words.slice(0, 18).join(' ')}…`;
}

function estimateSegmentSeconds(
  type: ShowSegment['type'],
  points: TalkingPoint[],
  rawText?: string,
): number {
  const pointTextWords = points.reduce(
    (sum, point) => sum + countWords(stripMarkdown(point.text)),
    0,
  );
  const sourceCount = points.reduce(
    (sum, point) => sum + point.sources.length,
    0,
  );
  const rawTextWords = rawText ? countWords(stripMarkdown(rawText)) : 0;
  const totalWords = pointTextWords + rawTextWords;

  switch (type) {
    case 'intro':
      return clampSeconds(totalWords * 4 + 20, 45, 180);
    case 'segment':
      return clampSeconds(
        totalWords * 4 + points.length * 50 + sourceCount * 15,
        180,
        900,
      );
    case 'hottake':
      return clampSeconds(totalWords * 4.5 + 90, 120, 480);
    case 'conclusion':
      return clampSeconds(totalWords * 3.5 + points.length * 35, 120, 360);
  }
}

function buildShowRundown(sections: ParsedSection[]): ShowSegment[] {
  const talkingSections = sections.filter((s) =>
    isTalkingPointSection(s.heading),
  );
  const summary = sections.find((s) => s.heading === 'Summary');
  const hotTake = sections.find((s) => s.heading === 'Hot Take');

  const segments: ShowSegment[] = [];
  let segNum = 0;
  let currentSeconds = 0;

  // Intro — one clean opener, timed from the actual prompt size.
  const introHook = buildColdOpenHook(summary);
  const introPoints = [{ sources: [], text: introHook }];
  const introSeconds = estimateSegmentSeconds('intro', introPoints);
  segments.push({
    duration: formatSegmentDuration(introSeconds),
    label: 'Cold Open',
    number: segNum++,
    points: introPoints,
    time: formatSegmentTime(currentSeconds),
    type: 'intro',
  });
  currentSeconds += introSeconds;

  for (const section of talkingSections) {
    const points = parseTalkingPoints(section.body);
    const shortLabel = section.heading
      .replace(/^Talking Points?\s*—?\s*/i, '')
      .replace(/^—\s*/, '');
    const segmentSeconds = estimateSegmentSeconds('segment', points);

    segments.push({
      duration: formatSegmentDuration(segmentSeconds),
      label: shortLabel || section.heading,
      number: segNum++,
      points,
      time: formatSegmentTime(currentSeconds),
      type: 'segment',
    });
    currentSeconds += segmentSeconds;
  }

  // Hot take
  if (hotTake) {
    const hotTakeSeconds = estimateSegmentSeconds('hottake', [], hotTake.body);
    segments.push({
      duration: formatSegmentDuration(hotTakeSeconds),
      label: 'Hot Take',
      number: segNum++,
      points: [],
      rawText: hotTake.body,
      time: formatSegmentTime(currentSeconds),
      type: 'hottake',
    });
    currentSeconds += hotTakeSeconds;
  }

  // Conclusion
  const conclusionPoints = [
    { sources: [], text: 'Recap the key takeaways' },
    { sources: [], text: 'What does this mean for indie devs this week?' },
    { sources: [], text: 'Shoutouts, like & subscribe, next stream teaser' },
    { sources: [], text: 'Open floor for chat questions' },
  ];
  const conclusionSeconds = estimateSegmentSeconds(
    'conclusion',
    conclusionPoints,
  );
  segments.push({
    duration: formatSegmentDuration(conclusionSeconds),
    label: 'Wrap Up & Chat Q&A',
    number: segNum++,
    points: conclusionPoints,
    time: formatSegmentTime(currentSeconds),
    type: 'conclusion',
  });

  return segments;
}

function getBadgeForUrl(url: string): { badge: string; cls: string } {
  if (url.includes('news.ycombinator'))
    return { badge: 'HN', cls: SOURCE_COLORS.HN };
  if (url.includes('github.com'))
    return { badge: 'GH', cls: SOURCE_COLORS.GitHub };
  if (url.includes('techcrunch'))
    return { badge: 'TC', cls: 'bg-green-500/20 text-green-400' };
  if (url.includes('venturebeat'))
    return { badge: 'VB', cls: 'bg-purple-500/20 text-purple-400' };
  if (url.includes('theregister'))
    return { badge: 'REG', cls: 'bg-blue-500/20 text-blue-400' };
  if (url.includes('medium.com'))
    return { badge: 'MED', cls: 'bg-emerald-500/20 text-emerald-400' };
  if (url.includes('cnbc.com'))
    return { badge: 'CNBC', cls: 'bg-blue-500/20 text-blue-400' };
  if (url.includes('axios.com'))
    return { badge: 'AX', cls: 'bg-blue-400/20 text-blue-300' };
  if (url.includes('dev.to'))
    return { badge: 'DEV', cls: 'bg-indigo-500/20 text-indigo-400' };
  if (url.includes('reddit.com'))
    return { badge: 'RED', cls: SOURCE_COLORS.Reddit };
  if (url.includes('youtube.com'))
    return { badge: 'YT', cls: SOURCE_COLORS.YouTube };
  if (url.includes('twitter.com') || url.includes('x.com'))
    return { badge: 'X', cls: SOURCE_COLORS.X };
  try {
    const host =
      new URL(url).hostname
        .split('.')
        .slice(-2, -1)[0]
        ?.toUpperCase()
        .slice(0, 4) || 'WEB';
    return { badge: host, cls: 'bg-surface-border text-text-muted' };
  } catch {
    return { badge: 'WEB', cls: 'bg-surface-border text-text-muted' };
  }
}

const SEGMENT_COLORS: Record<
  string,
  { time: string; dot: string; line: string }
> = {
  conclusion: {
    dot: 'bg-green-400',
    line: 'bg-green-400/20',
    time: 'text-green-400',
  },
  hottake: {
    dot: 'bg-yellow-400',
    line: 'bg-yellow-400/20',
    time: 'text-yellow-400',
  },
  intro: { dot: 'bg-blue-400', line: 'bg-blue-400/20', time: 'text-blue-400' },
  segment: {
    dot: 'bg-accent-red',
    line: 'bg-accent-red/20',
    time: 'text-accent-red',
  },
};

export default function TopicDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const date = searchParams.get('date') || todayLocalDate();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedDate, setResolvedDate] = useState(date);
  const [streamMeta, setStreamMeta] = useState<LivestreamMeta | null>(null);
  const [xReactions, setXReactions] = useState<TrendItem[]>([]);
  const [activeSegmentNumber, setActiveSegmentNumber] = useState(0);
  const rundownScrollRef = useRef<HTMLElement | null>(null);
  const segmentRefs = useRef(new Map<number, HTMLDivElement>());

  const fetchTopics = useCallback(async () => {
    const startedAt = performance.now();
    try {
      const res = await fetch(`/api/livestream?date=${date}`);
      const data = await parseJsonResponse<
        LivestreamListResponse | { error: string }
      >(res);
      if (!res.ok || isErrorResponse(data)) {
        throw new Error(
          isErrorResponse(data) ? data.error : `API error ${res.status}`,
        );
      }
      setTopics(data.topics);
      setResolvedDate(data.resolvedDate);
      logClientPerf('livestream_topic_fetch_topics', {
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        requestedDate: date,
        resolvedDate: data.resolvedDate,
        slug,
        topicCount: data.topics.length,
      });
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const fetchStreamMeta = useCallback(async () => {
    const startedAt = performance.now();
    const res = await fetch(`/api/livestream/${slug}/youtube?date=${date}`);
    const data = await parseJsonResponse<LivestreamMeta>(res);
    setStreamMeta(data);
    logClientPerf('livestream_topic_fetch_stream_meta', {
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      liveStatus: data.liveStatus,
      requestedDate: date,
      slug,
    });
  }, [date, slug]);

  useEffect(() => {
    fetchStreamMeta();
    const interval = setInterval(fetchStreamMeta, 30000);
    return () => clearInterval(interval);
  }, [fetchStreamMeta]);

  useEffect(() => {
    logClientEvent('livestream_topic_view', { requestedDate: date, slug });
  }, [slug, date]);

  const topic = topics.find((t) => t.slug === slug);
  const sections = parseMarkdownSections(topic?.content ?? '');
  const sourceBadges = topic?.source.split(',').map((s) => s.trim()) ?? [];
  const summarySection = sections.find((s) => s.heading === 'Summary');
  const hotTakeSection = sections.find((s) => s.heading === 'Hot Take');
  const livestreamNotesSection = sections.find(
    (s) => s.heading === 'Livestream Notes',
  );
  const livestreamNoteLinks = extractMarkdownLinks(
    livestreamNotesSection?.body ?? '',
  );
  const restreamLink =
    livestreamNoteLinks.find((link) => isRestreamUrl(link.url)) ?? null;
  const segments = buildShowRundown(sections);
  const activeSegment =
    segments.find((seg) => seg.number === activeSegmentNumber) || segments[0];
  const keyFacts = segments
    .filter((seg) => seg.type === 'segment')
    .flatMap((seg) => seg.points.slice(0, 2))
    .map((point) => clampText(stripMarkdown(point.text), 170))
    .slice(0, 6);
  const cohostCues = [
    hotTakeSection
      ? `Push on the main angle: ${clampText(stripMarkdown(hotTakeSection.body), 140)}`
      : 'Push on the strongest claim and ask if the backlash is actually deserved.',
    segments[1]
      ? `Jump in on "${segments[1].label}" and ask whether this was a one-off mistake or a deeper platform problem.`
      : 'Ask whether this changes how devs should trust the platform.',
    segments[2]
      ? `Use "${segments[2].label}" to bring the conversation back to how this affects real users this week.`
      : 'Ask what this means for indie devs using the product right now.',
    'If chat disagrees, ask what Anthropic should have done instead.',
  ];
  const keyLinks = (() => {
    const links: MarkdownLink[] = [];

    if (streamMeta?.youtubeUrl) {
      links.push({
        text: streamMeta.liveStatus === 'live' ? 'Livestream' : 'Replay',
        url: streamMeta.youtubeUrl,
      });
    }

    for (const link of livestreamNoteLinks) {
      links.push(link);
    }

    for (const segment of segments.filter((seg) => seg.type === 'segment')) {
      const firstSource = segment.points
        .flatMap((point) => point.sources)
        .at(0);
      if (firstSource) {
        links.push({
          text: `${segment.label} — ${stripSourcePrefix(firstSource.text)}`,
          url: firstSource.url,
        });
      }
    }

    const deduped = new Map<string, MarkdownLink>();
    for (const link of links) {
      if (!deduped.has(link.url)) deduped.set(link.url, link);
    }
    return Array.from(deduped.values()).slice(0, 7);
  })();
  const topicSearchQuery = topic
    ? buildTopicSearchQuery(topic.title, summarySection?.body)
    : '';

  const fetchXReactions = useCallback(async () => {
    if (!topicSearchQuery) {
      setXReactions([]);
      return;
    }

    const startedAt = performance.now();
    const res = await fetch(
      `/api/trends/search?q=${encodeURIComponent(topicSearchQuery)}`,
    );
    const data = await parseJsonResponse<
      TrendsSearchResponse | { error: string }
    >(res);

    if (!res.ok || isErrorResponse(data)) {
      throw new Error(
        isErrorResponse(data) ? data.error : `API error ${res.status}`,
      );
    }

    const tweets = data.items
      .filter((item) => item.source === 'x' && isTweetUrl(item.url))
      .slice(0, 12);

    setXReactions(tweets);
    logClientPerf('livestream_topic_fetch_x_reactions', {
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      query: topicSearchQuery,
      resultCount: tweets.length,
      slug,
    });
  }, [slug, topicSearchQuery]);

  useEffect(() => {
    fetchXReactions().catch(() => {
      setXReactions([]);
    });
  }, [fetchXReactions]);

  const setSegmentRef = useCallback(
    (segmentNumber: number, node: HTMLDivElement | null) => {
      if (node) {
        segmentRefs.current.set(segmentNumber, node);
        return;
      }
      segmentRefs.current.delete(segmentNumber);
    },
    [],
  );

  const jumpToSegment = useCallback((segmentNumber: number) => {
    const root = rundownScrollRef.current;
    const node = segmentRefs.current.get(segmentNumber);
    if (!root || !node) return;

    const stickyOffset = 88;
    root.scrollTo({
      behavior: 'smooth',
      top: Math.max(0, node.offsetTop - stickyOffset),
    });
    setActiveSegmentNumber(segmentNumber);
  }, []);

  useEffect(() => {
    setActiveSegmentNumber(segments[0]?.number ?? 0);
  }, [slug, date, topic?.content]);

  useEffect(() => {
    const root = rundownScrollRef.current;
    if (!root || segments.length === 0) return;
    const stickyOffset = 88;

    const updateActiveSegment = () => {
      const scrollTop = root.scrollTop;
      let nextActive = segments[0]?.number ?? 0;

      for (const segment of segments) {
        const node = segmentRefs.current.get(segment.number);
        if (!node) continue;

        if (node.offsetTop - stickyOffset <= scrollTop) {
          nextActive = segment.number;
        } else {
          break;
        }
      }

      setActiveSegmentNumber((current) =>
        current === nextActive ? current : nextActive,
      );
    };

    updateActiveSegment();
    root.addEventListener('scroll', updateActiveSegment, { passive: true });
    window.addEventListener('resize', updateActiveSegment);

    return () => {
      root.removeEventListener('scroll', updateActiveSegment);
      window.removeEventListener('resize', updateActiveSegment);
    };
  }, [topic?.content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-text-primary">
        <AppHeader subtitle="Livestream Topic" activeHref="/livestream" />
        <LivestreamTopicContentSkeleton />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Topic not found</p>
          <Link
            href="/livestream"
            className="text-accent-red text-sm hover:underline"
          >
            Back to board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader subtitle="Livestream Topic" activeHref="/livestream" />

      {/* Two-column layout */}
      <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>
        {/* Left: Show Rundown — timeline layout */}
        <main
          ref={rundownScrollRef}
          className="flex-1 overflow-y-auto px-8 py-8"
        >
          <div className="mx-auto w-full max-w-[1480px]">
            <div className="mb-6 flex items-start gap-3">
              <Link
                href={`/livestream?date=${date}`}
                className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center hover:border-accent-red/30 transition-colors shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-text-primary leading-tight">
                  {topic.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {sourceBadges.map((src) => (
                    <span
                      key={src}
                      className={`text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded ${SOURCE_COLORS[src] || 'bg-surface-border text-text-secondary'}`}
                    >
                      {src}
                    </span>
                  ))}
                  <span
                    className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${STATUS_BADGES[topic.status]}`}
                  >
                    {topic.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {topic.date}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    ~1h stream
                  </span>
                </div>
              </div>
            </div>
            {activeSegment && (
              <div className="sticky top-0 z-20 mb-6 -mx-2 px-2 pb-3">
                <div className="rounded-xl border border-surface-border bg-surface/92 backdrop-blur supports-[backdrop-filter]:bg-surface/78 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Now Covering
                    </span>
                    <span className="h-1 w-1 rounded-full bg-text-muted/50" />
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {activeSegment.label}
                    </span>
                    <span
                      className={`ml-auto text-[10px] font-mono font-bold ${SEGMENT_COLORS[activeSegment.type].time}`}
                    >
                      {activeSegment.time}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="relative">
              {segments.map((seg, segIdx) => {
                const colors = SEGMENT_COLORS[seg.type];
                const isLast = segIdx === segments.length - 1;

                return (
                  <div
                    key={seg.number}
                    ref={(node) => setSegmentRef(seg.number, node)}
                    data-segment-number={seg.number}
                    className="relative flex gap-6 scroll-mt-24 pb-10 last:pb-0"
                  >
                    <div className="flex flex-col items-center shrink-0 w-12">
                      <span
                        className={`text-[10px] font-mono font-bold ${colors.time} mb-2`}
                      >
                        {seg.time}
                      </span>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${colors.dot} shrink-0 ring-4 ring-surface`}
                      />
                      {!isLast && (
                        <div className={`w-px flex-1 mt-2 ${colors.line}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 -mt-1">
                      <div className="flex items-baseline gap-3 mb-5">
                        <h2 className="text-[26px] font-bold text-text-primary tracking-tight leading-tight">
                          {seg.label}
                        </h2>
                        <span className="text-xs text-text-muted font-mono">
                          {seg.duration}
                        </span>
                      </div>

                      {seg.rawText && (
                        <div className="bg-yellow-500/5 border-l-2 border-yellow-500/40 pl-4 py-3 mb-4">
                          <p className="text-[20px] text-text-primary leading-[1.7]">
                            {seg.rawText}
                          </p>
                        </div>
                      )}

                      {seg.points.length > 0 && (
                        <div className="flex flex-col gap-5">
                          {seg.points.map((point, i) => (
                            <div key={i} className="group">
                              <div className="flex gap-4">
                                <span className="text-[11px] font-mono font-bold text-text-muted/40 select-none shrink-0 pt-0.5 w-4 text-right">
                                  {seg.type === 'hottake'
                                    ? '\u26A1'
                                    : `${i + 1}`}
                                </span>

                                <div className="flex-1 min-w-0">
                                  <p className="text-[20px] text-text-primary leading-[1.7] font-medium">
                                    {renderInlineLinks(point.text)}
                                  </p>

                                  {point.sources.length > 0 &&
                                    (() => {
                                      const tweets = point.sources.filter((s) =>
                                        isTweetUrl(s.url),
                                      );
                                      const others = point.sources.filter(
                                        (s) => !isTweetUrl(s.url),
                                      );
                                      const ordered = [...tweets, ...others];
                                      return (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                          {ordered.map((src, j) => {
                                            const { badge, cls } =
                                              getBadgeForUrl(src.url);
                                            return (
                                              <a
                                                key={j}
                                                href={src.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-text-secondary hover:text-text-primary hover:border-accent-red/30 transition-colors max-w-full"
                                              >
                                                <span
                                                  className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${cls}`}
                                                >
                                                  {badge}
                                                </span>
                                                <span className="truncate max-w-[360px]">
                                                  {stripSourcePrefix(src.text)}
                                                </span>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-[420px] shrink-0 border-l border-surface-border overflow-y-auto p-4 space-y-4">
          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Co-Host Prep
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid gap-2">
                {streamMeta?.youtubeUrl && (
                  <a
                    href={streamMeta.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-accent-red px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <span>
                      {streamMeta.liveStatus === 'live' ||
                      streamMeta.liveStatus === 'scheduled'
                        ? 'Open Livestream Link'
                        : 'Open Replay Link'}
                    </span>
                  </a>
                )}

                {restreamLink && (
                  <a
                    href={restreamLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-3 text-sm font-semibold text-text-primary hover:border-accent-red/30 hover:text-accent-red transition-colors"
                  >
                    <span>Open Restream Studio</span>
                  </a>
                )}

                <Link
                  href={`/livestream/${slug}/draw?date=${date}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-elevated/50 px-4 py-3 text-sm font-semibold text-text-primary hover:border-accent-red/30 hover:text-accent-red transition-colors"
                >
                  <span>Open Drawing Board</span>
                </Link>
              </div>

              {streamMeta?.thumbnailUrl && (
                <img
                  src={streamMeta.thumbnailUrl}
                  alt={streamMeta.title || topic.title}
                  className="w-full rounded-lg border border-surface-border"
                />
              )}

              {(streamMeta?.title ||
                streamMeta?.channelTitle ||
                summarySection?.body) && (
                <div>
                  {streamMeta?.title && (
                    <p className="text-sm font-semibold text-text-primary leading-snug">
                      {streamMeta.title}
                    </p>
                  )}
                  {streamMeta?.channelTitle && (
                    <p className="text-xs text-text-muted mt-1">
                      {streamMeta.channelTitle}
                    </p>
                  )}
                  {summarySection?.body && (
                    <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                      {clampText(stripMarkdown(summarySection.body), 220)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">Status</span>
                  <span
                    className={`text-[11px] font-medium uppercase px-2 py-1 rounded ${
                      streamMeta?.liveStatus === 'live'
                        ? 'bg-red-500/10 text-red-400'
                        : streamMeta?.liveStatus === 'ended'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-surface-border text-text-secondary'
                    }`}
                  >
                    {streamMeta?.liveStatus || 'missing'}
                  </span>
                </div>

                {streamMeta?.youtubeUrl && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">YouTube</span>
                    <a
                      href={streamMeta.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-red hover:underline truncate max-w-[220px] text-right"
                    >
                      {streamMeta.liveStatus === 'live'
                        ? 'Open stream'
                        : 'Open replay'}
                    </a>
                  </div>
                )}

                {streamMeta?.viewCount !== undefined && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">Views</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {formatCompactNumber(streamMeta.viewCount)}
                    </span>
                  </div>
                )}

                {streamMeta?.liveStatus === 'live' && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">
                      Current viewers
                    </span>
                    <span className="text-sm font-semibold text-red-400">
                      {formatCompactNumber(streamMeta.concurrentViewers)}
                    </span>
                  </div>
                )}

                {streamMeta?.actualStartTime && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">Started</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(streamMeta.actualStartTime).toLocaleString()}
                    </span>
                  </div>
                )}

                {streamMeta?.actualEndTime && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-text-muted">Ended</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(streamMeta.actualEndTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Episode Brief
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted mb-2">
                  What Happened
                </p>
                <p className="text-sm text-text-primary leading-relaxed">
                  {summarySection
                    ? stripMarkdown(summarySection.body)
                    : 'No summary provided yet.'}
                </p>
              </div>
              {hotTakeSection && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-yellow-300/80 mb-2">
                    What Side To Take
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {stripMarkdown(hotTakeSection.body)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Segment Timeline
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {segments.map((seg) => (
                <button
                  key={seg.number}
                  type="button"
                  onClick={() => jumpToSegment(seg.number)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    activeSegmentNumber === seg.number
                      ? 'border-accent-red/30 bg-accent-red/5'
                      : 'border-surface-border/70 bg-surface-elevated/30 hover:border-accent-red/20 hover:bg-surface-elevated/50'
                  }`}
                >
                  <span
                    className={`text-[11px] font-mono font-bold mt-0.5 ${SEGMENT_COLORS[seg.type].time}`}
                  >
                    {seg.time}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary leading-snug">
                      {seg.label}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {seg.duration}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Co-Host Cues
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {cohostCues.map((cue) => (
                <div key={cue} className="flex gap-3">
                  <span className="text-[11px] font-mono font-bold text-accent-red mt-0.5">
                    Q
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {cue}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Must-Hit Facts
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {keyFacts.map((fact, index) => (
                <div key={`${index}-${fact}`} className="flex gap-3">
                  <span className="text-[11px] font-mono font-bold text-text-muted mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Key Links
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {keyLinks.map((link, index) => {
                const { badge, cls } = getBadgeForUrl(link.url);
                return (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:border-accent-red/30 transition-colors"
                  >
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${cls}`}
                    >
                      {index === 0 && streamMeta?.youtubeUrl === link.url
                        ? 'LIVE'
                        : badge}
                    </span>
                    <span className="truncate">
                      {stripSourcePrefix(link.text)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border">
              <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                X Reactions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {xReactions.length > 0 ? (
                xReactions.map((tweet) => (
                  <a
                    key={tweet.id}
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-surface-border px-3 py-3 transition-colors hover:border-accent-red/30"
                  >
                    <div className="flex items-center gap-2 text-[10px] text-text-muted">
                      <span className="rounded bg-blue-400/20 px-1.5 py-0.5 font-mono font-bold text-blue-400">
                        X
                      </span>
                      {tweet.author ? (
                        <span className="truncate text-text-secondary">
                          {tweet.author}
                        </span>
                      ) : null}
                      <span className="ml-auto font-mono">
                        {formatCompactNumber(tweet.score)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-primary">
                      {clampText(tweet.title, 180)}
                    </p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-text-muted">
                  No matching tweets surfaced for this topic yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
