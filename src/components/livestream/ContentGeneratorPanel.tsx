"use client";

import { useState, useCallback, useEffect } from "react";
import {
  generateAllContent,
  generateThumbnailV1,
  generateThumbnailV2,
  generateThumbnailV3,
  generateYouTubeTitle,
  generateYouTubeDescription,
  generateLinkedInPost,
  generateLivestreamTweet,
  generateRecapTweet,
  type ContentInput,
  type GeneratedContent,
} from "@/lib/content-generator";
import type { ContentField, TopicGeneratedContent } from "@/lib/livestream-types";
import { logClientEvent, logClientPerf } from "@/lib/client-logger";

interface ContentGeneratorPanelProps {
  title: string;
  hotTake: string;
  summary: string;
  source: string;
  date: string;
  saved: TopicGeneratedContent;
  onSaveField: (field: ContentField, value: string) => void;
}

// Map content fields to their individual regenerator functions
const FIELD_GENERATORS: Record<ContentField, (input: ContentInput) => string> = {
  thumbnail_v1: generateThumbnailV1,
  thumbnail_v2: generateThumbnailV2,
  thumbnail_v3: generateThumbnailV3,
  youtube_title: generateYouTubeTitle,
  youtube_description: generateYouTubeDescription,
  linkedin_post: generateLinkedInPost,
  livestream_tweet: generateLivestreamTweet,
  recap_tweet: generateRecapTweet,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-medium px-2 py-1 rounded bg-surface-border text-text-muted hover:text-text-primary transition-colors shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ContentBlock({
  label,
  field,
  content,
  savedValue,
  compact,
  onRegenerate,
  onSave,
}: {
  label: string;
  field: ContentField;
  content: string;
  savedValue: string | null;
  compact?: boolean;
  onRegenerate: (field: ContentField) => void;
  onSave: (field: ContentField, value: string) => void;
}) {
  const isSaved = savedValue === content;

  return (
    <div className="bg-surface-elevated rounded-lg border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onRegenerate(field)}
            className="text-[10px] font-medium px-2 py-1 rounded bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
          >
            Regen
          </button>
          <CopyButton text={content} />
          <button
            onClick={() => onSave(field, content)}
            className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
              isSaved
                ? "bg-green-500/20 text-green-400"
                : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className={compact ? "px-3 py-2" : "px-3 py-3"}>
        <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}

export function ContentGeneratorPanel({
  title,
  hotTake,
  summary,
  source,
  date,
  saved,
  onSaveField,
}: ContentGeneratorPanelProps) {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<"thumbnails" | "copy">("thumbnails");
  const [activeThumb, setActiveThumb] = useState(0);

  const input: ContentInput = { title, hotTake, summary, source, date };

  useEffect(() => {
    if (!hasSavedContent(saved)) return;

    const restored: GeneratedContent = {
      thumbnails: [
        { label: "Shock & Drama", prompt: saved.thumbnail_v1 || "" },
        { label: "Boss Energy", prompt: saved.thumbnail_v2 || "" },
        { label: "Scale & Growth", prompt: saved.thumbnail_v3 || "" },
      ],
      youtubeTitle: saved.youtube_title || "",
      youtubeDescription: saved.youtube_description || "",
      linkedinPost: saved.linkedin_post || "",
      livestreamTweet: saved.livestream_tweet || "",
      recapTweet: saved.recap_tweet || "",
    };

    setContent(restored);
  }, [
    saved.thumbnail_v1,
    saved.thumbnail_v2,
    saved.thumbnail_v3,
    saved.youtube_title,
    saved.youtube_description,
    saved.linkedin_post,
    saved.livestream_tweet,
    saved.recap_tweet,
  ]);

  useEffect(() => {
    logClientEvent("content_generator_mount", {
      title,
      hasSavedContent: hasSavedContent(saved),
    });
  }, [title, saved]);

  function handleGenerateAll() {
    const startedAt = performance.now();
    const generated = generateAllContent(input);
    setContent(generated);
    setActiveThumb(0);
    logClientPerf("content_generator_generate_all", {
      title,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
    });
  }

  const handleRegenerate = useCallback(
    (field: ContentField) => {
      if (!content) return;
      const startedAt = performance.now();
      const newValue = FIELD_GENERATORS[field](input);
      const updated = { ...content };

      if (field === "thumbnail_v1") updated.thumbnails = [{ ...updated.thumbnails[0], prompt: newValue }, updated.thumbnails[1], updated.thumbnails[2]];
      else if (field === "thumbnail_v2") updated.thumbnails = [updated.thumbnails[0], { ...updated.thumbnails[1], prompt: newValue }, updated.thumbnails[2]];
      else if (field === "thumbnail_v3") updated.thumbnails = [updated.thumbnails[0], updated.thumbnails[1], { ...updated.thumbnails[2], prompt: newValue }];
      else if (field === "youtube_title") updated.youtubeTitle = newValue;
      else if (field === "youtube_description") updated.youtubeDescription = newValue;
      else if (field === "linkedin_post") updated.linkedinPost = newValue;
      else if (field === "livestream_tweet") updated.livestreamTweet = newValue;
      else if (field === "recap_tweet") updated.recapTweet = newValue;

      setContent(updated);
      logClientPerf("content_generator_regenerate_field", {
        title,
        field,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      });
    },
    [content, input]
  );

  const handleSave = useCallback(
    (field: ContentField, value: string) => {
      logClientEvent("content_generator_save_field", {
        title,
        field,
        size: value.length,
      });
      onSaveField(field, value);
    },
    [onSaveField]
  );

  const thumbFields: ContentField[] = ["thumbnail_v1", "thumbnail_v2", "thumbnail_v3"];

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <h3 className="text-sm font-semibold text-text-primary">
          Content Generator
        </h3>
        <button
          onClick={handleGenerateAll}
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
        >
          {content ? "Regenerate All" : "Generate"}
        </button>
      </div>

      {!content ? (
        <div className="px-5 py-10 text-center">
          <p className="text-xs text-text-muted">
            Generate 3 thumbnail prompt variants + YouTube, LinkedIn &amp; Twitter copy
          </p>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex border-b border-surface-border">
            <button
              onClick={() => setActiveTab("thumbnails")}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                activeTab === "thumbnails"
                  ? "text-accent-red border-b-2 border-accent-red"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Thumbnail Prompts (3)
            </button>
            <button
              onClick={() => setActiveTab("copy")}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                activeTab === "copy"
                  ? "text-accent-red border-b-2 border-accent-red"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Social Copy
            </button>
          </div>

          {/* Thumbnails tab */}
          {activeTab === "thumbnails" && (
            <div className="p-5">
              {/* Variant selector */}
              <div className="flex gap-2 mb-4">
                {content.thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                      activeThumb === i
                        ? "border-accent-red bg-accent-red/10 text-accent-red"
                        : "border-surface-border bg-surface-elevated text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    <span className="block text-[10px] text-text-muted mb-0.5">V{i + 1}</span>
                    {thumb.label}
                  </button>
                ))}
              </div>

              {/* Active prompt */}
              <ContentBlock
                label={`Nano Banana 2 — V${activeThumb + 1}`}
                field={thumbFields[activeThumb]}
                content={content.thumbnails[activeThumb].prompt}
                savedValue={saved[thumbFields[activeThumb]]}
                onRegenerate={handleRegenerate}
                onSave={handleSave}
              />
            </div>
          )}

          {/* Copy tab */}
          {activeTab === "copy" && (
            <div className="p-5 space-y-4">
              <ContentBlock label="YouTube Title" field="youtube_title" content={content.youtubeTitle} savedValue={saved.youtube_title} compact onRegenerate={handleRegenerate} onSave={handleSave} />
              <ContentBlock label="YouTube Description" field="youtube_description" content={content.youtubeDescription} savedValue={saved.youtube_description} onRegenerate={handleRegenerate} onSave={handleSave} />
              <ContentBlock label="LinkedIn Post" field="linkedin_post" content={content.linkedinPost} savedValue={saved.linkedin_post} onRegenerate={handleRegenerate} onSave={handleSave} />
              <ContentBlock label="Tweet — Livestream" field="livestream_tweet" content={content.livestreamTweet} savedValue={saved.livestream_tweet} compact onRegenerate={handleRegenerate} onSave={handleSave} />
              <ContentBlock label="Tweet — Recap" field="recap_tweet" content={content.recapTweet} savedValue={saved.recap_tweet} compact onRegenerate={handleRegenerate} onSave={handleSave} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function hasSavedContent(saved: TopicGeneratedContent): boolean {
  return Object.values(saved).some((v) => v !== null);
}
