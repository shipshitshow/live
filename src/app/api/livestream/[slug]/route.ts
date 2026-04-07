import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { TopicUpdate, ContentField } from "@/lib/livestream-types";
import { CONTENT_FIELDS } from "@/lib/livestream-types";

const DATA_DIR = path.join(process.cwd(), "data", "livestream");

function findTopicFile(slug: string, date: string): string | null {
  const dir = path.join(DATA_DIR, date);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    if (raw.includes(`slug: "${slug}"`)) {
      return path.join(dir, file);
    }
  }
  return null;
}

function updateFrontmatterField(raw: string, key: string, value: string | null): string {
  const valStr = value === null ? "null" : `"${value}"`;
  const regex = new RegExp(`^(${key}:).*$`, "m");
  if (regex.test(raw)) {
    return raw.replace(regex, `$1 ${valStr}`);
  }
  return raw.replace(/\n---\n/, `\n${key}: ${valStr}\n---\n`);
}

function updateGeneratedField(raw: string, field: ContentField, value: string): string {
  const marker = "## Generated Content";
  const tag = `<!-- ${field} -->`;
  const endTag = `<!-- /${field} -->`;

  // If no generated content section exists, append one
  if (!raw.includes(marker)) {
    raw = raw.trimEnd() + `\n\n${marker}\n\n`;
  }

  // If field tags exist, replace content between them
  const tagIdx = raw.indexOf(tag);
  const endTagIdx = raw.indexOf(endTag);
  if (tagIdx !== -1 && endTagIdx !== -1) {
    return raw.slice(0, tagIdx + tag.length) + "\n" + value + "\n" + raw.slice(endTagIdx);
  }

  // Otherwise append the field at the end
  return raw.trimEnd() + `\n${tag}\n${value}\n${endTag}\n`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(_request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const filePath = findTopicFile(slug, date);

  if (!filePath) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return NextResponse.json({ raw });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const filePath = findTopicFile(slug, date);

  if (!filePath) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const updates: TopicUpdate = await request.json();
  let raw = fs.readFileSync(filePath, "utf-8");

  if (updates.status) {
    raw = updateFrontmatterField(raw, "status", updates.status);
  }
  if (updates.thumbnail_prompt !== undefined) {
    raw = updateFrontmatterField(raw, "thumbnail_prompt", updates.thumbnail_prompt);
  }

  // Save generated content fields
  if (updates.generated) {
    for (const field of CONTENT_FIELDS) {
      const value = updates.generated[field];
      if (value !== undefined && value !== null) {
        raw = updateGeneratedField(raw, field, value);
      }
    }
  }

  fs.writeFileSync(filePath, raw, "utf-8");
  return NextResponse.json({ ok: true });
}
