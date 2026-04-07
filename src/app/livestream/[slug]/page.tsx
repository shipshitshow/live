"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Topic, ContentField } from "@/lib/livestream-types";
import { ContentGeneratorPanel } from "@/components/livestream/ContentGeneratorPanel";
import { TweetEmbed, isTweetUrl } from "@/components/livestream/TweetEmbed";

const SOURCE_COLORS: Record<string, string> = {
  HN: "bg-orange-500/20 text-orange-400",
  X: "bg-blue-400/20 text-blue-400",
  YouTube: "bg-red-500/20 text-red-400",
  Reddit: "bg-orange-600/20 text-orange-300",
  GitHub: "bg-purple-500/20 text-purple-400",
};

const STATUS_BADGES: Record<string, string> = {
  backlog: "bg-surface-border text-text-muted",
  in_progress: "bg-accent-red/10 text-accent-red",
  done: "bg-green-500/10 text-green-400",
};

interface ParsedSection {
  heading: string;
  body: string;
}

function parseMarkdownSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split("\n");
  let currentHeading = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
      }
      currentHeading = line.slice(3);
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join("\n").trim() });
  }
  return sections;
}

function isTalkingPointSection(heading: string): boolean {
  return heading.toLowerCase().includes("talking point");
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

// Parse a section body into structured talking points with inline sources
interface TalkingPoint {
  text: string;
  sources: { text: string; url: string }[];
}

function parseTalkingPoints(body: string): TalkingPoint[] {
  const lines = body.split("\n");
  const points: TalkingPoint[] = [];
  let current: TalkingPoint | null = null;

  for (const line of lines) {
    if (line.startsWith("- ") && !line.startsWith("  - ")) {
      // Top-level bullet = new talking point
      if (current) points.push(current);
      current = { text: line.slice(2), sources: [] };
    } else if (line.startsWith("  - ") && current) {
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
  type: "intro" | "segment" | "hottake" | "conclusion";
}

function buildShowRundown(sections: ParsedSection[]): ShowSegment[] {
  const talkingSections = sections.filter((s) => isTalkingPointSection(s.heading));
  const summary = sections.find((s) => s.heading === "Summary");
  const hotTake = sections.find((s) => s.heading === "Hot Take");

  const segments: ShowSegment[] = [];
  let segNum = 0;

  // Intro — straight into it
  const introHook = summary
    ? summary.body.split(".").slice(0, 2).join(".") + "."
    : "Let's get into it.";
  segments.push({
    number: segNum++,
    label: "Cold Open",
    time: "0:00",
    duration: "2 min",
    points: [
      { text: introHook, sources: [] },
    ],
    type: "intro",
  });

  // Talking point sections
  const totalTalkingTime = 45;
  const perSegment = talkingSections.length > 0 ? Math.floor(totalTalkingTime / talkingSections.length) : 45;
  let currentMin = 5;

  for (const section of talkingSections) {
    const points = parseTalkingPoints(section.body);
    const shortLabel = section.heading.replace(/^Talking Points?\s*—?\s*/i, "").replace(/^—\s*/, "");

    segments.push({
      number: segNum++,
      label: shortLabel || section.heading,
      time: `${currentMin}:00`,
      duration: `${perSegment} min`,
      points,
      type: "segment",
    });
    currentMin += perSegment;
  }

  // Hot take
  if (hotTake) {
    segments.push({
      number: segNum++,
      label: "Hot Take",
      time: `${currentMin}:00`,
      duration: "5 min",
      points: [],
      rawText: hotTake.body,
      type: "hottake",
    });
    currentMin += 5;
  }

  // Conclusion
  segments.push({
    number: segNum++,
    label: "Wrap Up & Chat Q&A",
    time: `${currentMin}:00`,
    duration: "5 min",
    points: [
      { text: "Recap the key takeaways", sources: [] },
      { text: "What does this mean for indie devs this week?", sources: [] },
      { text: "Shoutouts, like & subscribe, next stream teaser", sources: [] },
      { text: "Open floor for chat questions", sources: [] },
    ],
    type: "conclusion",
  });

  return segments;
}

function getBadgeForUrl(url: string): { badge: string; cls: string } {
  if (url.includes("news.ycombinator")) return { badge: "HN", cls: SOURCE_COLORS.HN };
  if (url.includes("github.com")) return { badge: "GH", cls: SOURCE_COLORS.GitHub };
  if (url.includes("techcrunch")) return { badge: "TC", cls: "bg-green-500/20 text-green-400" };
  if (url.includes("venturebeat")) return { badge: "VB", cls: "bg-purple-500/20 text-purple-400" };
  if (url.includes("theregister")) return { badge: "REG", cls: "bg-blue-500/20 text-blue-400" };
  if (url.includes("medium.com")) return { badge: "MED", cls: "bg-emerald-500/20 text-emerald-400" };
  if (url.includes("cnbc.com")) return { badge: "CNBC", cls: "bg-blue-500/20 text-blue-400" };
  if (url.includes("axios.com")) return { badge: "AX", cls: "bg-blue-400/20 text-blue-300" };
  if (url.includes("dev.to")) return { badge: "DEV", cls: "bg-indigo-500/20 text-indigo-400" };
  if (url.includes("reddit.com")) return { badge: "RED", cls: SOURCE_COLORS.Reddit };
  if (url.includes("youtube.com")) return { badge: "YT", cls: SOURCE_COLORS.YouTube };
  if (url.includes("twitter.com") || url.includes("x.com")) return { badge: "X", cls: SOURCE_COLORS.X };
  try {
    const host = new URL(url).hostname.split(".").slice(-2, -1)[0]?.toUpperCase().slice(0, 4) || "WEB";
    return { badge: host, cls: "bg-surface-border text-text-muted" };
  } catch {
    return { badge: "WEB", cls: "bg-surface-border text-text-muted" };
  }
}

const SEGMENT_COLORS: Record<string, { time: string; dot: string; line: string }> = {
  intro: { time: "text-blue-400", dot: "bg-blue-400", line: "bg-blue-400/20" },
  segment: { time: "text-accent-red", dot: "bg-accent-red", line: "bg-accent-red/20" },
  hottake: { time: "text-yellow-400", dot: "bg-yellow-400", line: "bg-yellow-400/20" },
  conclusion: { time: "text-green-400", dot: "bg-green-400", line: "bg-green-400/20" },
};

export default function TopicDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`/api/livestream?date=${date}`);
    const data = await res.json();
    setTopics(data);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const topic = topics.find((t) => t.slug === slug);

  async function handleSaveField(field: ContentField, value: string) {
    await fetch(`/api/livestream/${slug}?date=${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generated: { [field]: value } }),
    });
    fetchTopics();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <p className="text-text-muted text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-sm mb-4">Topic not found</p>
          <Link href="/livestream" className="text-accent-red text-sm hover:underline">
            Back to board
          </Link>
        </div>
      </div>
    );
  }

  const sections = parseMarkdownSections(topic.content);
  const sourceBadges = topic.source.split(",").map((s) => s.trim());
  const hotTakeSection = sections.find((s) => s.heading === "Hot Take");
  const segments = buildShowRundown(sections);

  // Collect all source links for the sidebar quick-reference
  const allSources: { text: string; url: string }[] = [];
  for (const seg of segments) {
    for (const pt of seg.points) {
      for (const src of pt.sources) {
        allSources.push(src);
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/livestream?date=${date}`}
            className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center hover:border-accent-red/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-none">
              {topic.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {sourceBadges.map((src) => (
                <span key={src} className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${SOURCE_COLORS[src] || "bg-surface-border text-text-secondary"}`}>
                  {src}
                </span>
              ))}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_BADGES[topic.status]}`}>
                {topic.status.replace("_", " ")}
              </span>
              <span className="text-[10px] text-text-muted font-mono">{topic.date}</span>
              <span className="text-[10px] text-text-muted">~1h stream</span>
            </div>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">Analytics</Link>
          <Link href="/review" className="hover:text-text-primary transition-colors">Unpublished</Link>
          <Link href="/livestream" className="hover:text-text-primary transition-colors">Livestream</Link>
        </nav>
      </header>

      {/* Two-column layout */}
      <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
        {/* Left: Show Rundown — timeline layout */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="relative">
            {segments.map((seg, segIdx) => {
              const colors = SEGMENT_COLORS[seg.type];
              const isLast = segIdx === segments.length - 1;

              return (
                <div key={seg.number} className="relative flex gap-6 pb-10 last:pb-0">
                  {/* Timeline track */}
                  <div className="flex flex-col items-center shrink-0 w-12">
                    <span className={`text-[10px] font-mono font-bold ${colors.time} mb-2`}>
                      {seg.time}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} shrink-0 ring-4 ring-surface`} />
                    {!isLast && (
                      <div className={`w-px flex-1 mt-2 ${colors.line}`} />
                    )}
                  </div>

                  {/* Segment content */}
                  <div className="flex-1 min-w-0 -mt-1">
                    {/* Header */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <h2 className="text-lg font-bold text-text-primary tracking-tight">{seg.label}</h2>
                      <span className="text-[10px] text-text-muted font-mono">{seg.duration}</span>
                    </div>

                    {/* Hot take = raw text block */}
                    {seg.rawText && (
                      <div className="bg-yellow-500/5 border-l-2 border-yellow-500/40 pl-4 py-3 mb-4">
                        <p className="text-[14px] text-text-secondary leading-[1.8]">
                          {seg.rawText}
                        </p>
                      </div>
                    )}

                    {/* Talking points */}
                    {seg.points.length > 0 && (
                      <div className="flex flex-col gap-5">
                        {seg.points.map((point, i) => (
                          <div key={i} className="group">
                            <div className="flex gap-4">
                              {/* Point number */}
                              <span className="text-[11px] font-mono font-bold text-text-muted/40 select-none shrink-0 pt-0.5 w-4 text-right">
                                {seg.type === "hottake" ? "\u26A1" : `${i + 1}`}
                              </span>

                              <div className="flex-1 min-w-0">
                                {/* Point text */}
                                <p className="text-[14px] text-text-secondary leading-[1.8]">
                                  {renderInlineLinks(point.text)}
                                </p>

                                {/* Sources */}
                                {point.sources.length > 0 && (() => {
                                  const tweets = point.sources.filter((s) => isTweetUrl(s.url));
                                  const others = point.sources.filter((s) => !isTweetUrl(s.url));
                                  return (
                                    <div className="mt-3 space-y-2">
                                      {/* Tweet embeds */}
                                      {tweets.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                          {tweets.map((src, j) => (
                                            <TweetEmbed key={j} url={src.url} />
                                          ))}
                                        </div>
                                      )}
                                      {/* Other sources — compact */}
                                      {others.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {others.map((src, j) => {
                                            const { badge, cls } = getBadgeForUrl(src.url);
                                            return (
                                              <a
                                                key={j}
                                                href={src.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-text-muted hover:text-text-secondary transition-colors"
                                              >
                                                <span className={`text-[8px] font-mono font-bold px-1 rounded ${cls}`}>
                                                  {badge}
                                                </span>
                                                <span className="truncate max-w-[200px]">
                                                  {src.text}
                                                </span>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      )}
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
        </main>

        {/* Right sidebar: Content Generator */}
        <aside className="w-[420px] shrink-0 border-l border-surface-border overflow-y-auto p-4">
          <ContentGeneratorPanel
            title={topic.title}
            hotTake={hotTakeSection?.body || ""}
            summary={sections.find((s) => s.heading === "Summary")?.body || ""}
            source={topic.source}
            date={topic.date}
            saved={topic.generated}
            onSaveField={handleSaveField}
          />
        </aside>
      </div>
    </div>
  );
}
