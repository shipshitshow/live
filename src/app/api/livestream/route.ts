import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { todayLocalDate } from "@/lib/date";
import type { ErrorResponse } from "@/lib/api-types";
import type { LivestreamListResponse, Topic, TopicFrontmatter, TopicGeneratedContent, TopicStatus } from "@/lib/livestream-types";
import { CONTENT_FIELDS } from "@/lib/livestream-types";
import { logError, logEvent } from "@/lib/logger";

const DATA_DIR = path.join(process.cwd(), "data", "livestream");

const EMPTY_GENERATED: TopicGeneratedContent = {
  thumbnail_v1: null,
  thumbnail_v2: null,
  thumbnail_v3: null,
  youtube_title: null,
  youtube_description: null,
  linkedin_post: null,
  livestream_tweet: null,
  recap_tweet: null,
};

function parseGeneratedContent(raw: string): TopicGeneratedContent {
  const marker = "## Generated Content";
  const idx = raw.indexOf(marker);
  if (idx === -1) return { ...EMPTY_GENERATED };

  const section = raw.slice(idx + marker.length);
  const result: TopicGeneratedContent = { ...EMPTY_GENERATED };

  for (const field of CONTENT_FIELDS) {
    const tag = `<!-- ${field} -->`;
    const endTag = `<!-- /${field} -->`;
    const start = section.indexOf(tag);
    const end = section.indexOf(endTag);
    if (start !== -1 && end !== -1) {
      result[field] = section.slice(start + tag.length, end).trim() || null;
    }
  }

  return result;
}

function parseFrontmatter(raw: string): { frontmatter: TopicFrontmatter; content: string; generated: TopicGeneratedContent } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid frontmatter");

  const fm: Record<string, string | null> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: string | null = line.slice(idx + 1).trim();
    if (val === "null") val = null;
    if (typeof val === "string") val = val.replace(/^["']|["']$/g, "");
    fm[key] = val;
  }

  // Split body content from generated content section
  const body = match[2].trim();
  const genMarker = "## Generated Content";
  const genIdx = body.indexOf(genMarker);
  const content = genIdx !== -1 ? body.slice(0, genIdx).trim() : body;
  const generated = parseGeneratedContent(raw);
  const title = fm.title;
  const slug = fm.slug;
  const source = fm.source;
  const status = fm.status;
  const date = fm.date;

  if (
    typeof title !== "string" ||
    typeof slug !== "string" ||
    typeof source !== "string" ||
    !isTopicStatus(status) ||
    typeof date !== "string"
  ) {
    throw new Error("Invalid topic frontmatter");
  }

  return {
    frontmatter: {
      title,
      slug,
      source,
      status,
      date,
      thumbnail_prompt: fm.thumbnail_prompt,
    },
    content,
    generated,
  };
}

function isTopicStatus(value: string | null): value is TopicStatus {
  return value === "backlog" || value === "in_progress" || value === "done";
}

function getTopicsForDate(dateStr: string): Topic[] {
  const dir = path.join(DATA_DIR, dateStr);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(dir, fileName), "utf-8");
      const { frontmatter, content, generated } = parseFrontmatter(raw);
      return { ...frontmatter, content, generated, fileName };
    });
}

function listAvailableDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

function resolveDate(requestedDate: string): string {
  const availableDates = listAvailableDates();
  if (availableDates.includes(requestedDate)) return requestedDate;
  return availableDates[0] || requestedDate;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get("date") || todayLocalDate();
  const resolvedDate = resolveDate(requestedDate);
  const availableDates = listAvailableDates();

  try {
    const topics = getTopicsForDate(resolvedDate);
    logEvent("api.livestream.list", {
      requestedDate,
      resolvedDate,
      topicCount: topics.length,
      isFallback: requestedDate !== resolvedDate,
    });

    const response: LivestreamListResponse = {
      topics,
      requestedDate,
      resolvedDate,
      availableDates,
      isFallback: requestedDate !== resolvedDate,
    };

    return NextResponse.json(response);
  } catch (error) {
    logError("api.livestream.list_failed", error, {
      requestedDate,
      resolvedDate,
    });
    const response: ErrorResponse = {
      error: error instanceof Error ? error.message : "Failed to load livestream topics",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, slug, source, date, content } = body as {
    title: string;
    slug: string;
    source: string;
    date: string;
    content: string;
  };

  const dir = path.join(DATA_DIR, date);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const existing = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const nextNum = existing.length + 1;
  const padded = String(nextNum).padStart(2, "0");
  const fileName = `topic-${padded}-${slug}.md`;

  const markdown = `---
title: "${title}"
slug: "${slug}"
source: "${source}"
status: "backlog"
date: "${date}"
thumbnail_prompt: null
---

${content}

## Generated Content
`;

  fs.writeFileSync(path.join(dir, fileName), markdown, "utf-8");
  logEvent("api.livestream.created", { title, slug, source, date, fileName });

  return NextResponse.json({ fileName, slug, status: "backlog" }, { status: 201 });
}
