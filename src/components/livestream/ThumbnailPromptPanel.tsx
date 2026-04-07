"use client";

import { useState } from "react";
import { generateThumbnailPrompt } from "@/lib/thumbnail-prompt";

interface ThumbnailPromptPanelProps {
  title: string;
  hotTake: string;
  source: string;
  savedPrompt: string | null;
  onSave: (prompt: string) => void;
}

export function ThumbnailPromptPanel({
  title,
  hotTake,
  source,
  savedPrompt,
  onSave,
}: ThumbnailPromptPanelProps) {
  const [prompt, setPrompt] = useState(savedPrompt || "");
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    const generated = generateThumbnailPrompt({ title, hotTake, source });
    setPrompt(generated);
  }

  function handleCopy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    onSave(prompt);
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Thumbnail Prompt
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
          >
            {prompt ? "Regenerate" : "Generate"}
          </button>
          {prompt && (
            <>
              <button
                onClick={handleCopy}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-border text-text-secondary hover:text-text-primary transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleSave}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {prompt ? (
        <div className="bg-surface-elevated rounded-lg p-4 border border-surface-border">
          <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
            {prompt}
          </pre>
        </div>
      ) : (
        <div className="bg-surface-elevated rounded-lg p-6 border border-dashed border-surface-border text-center">
          <p className="text-xs text-text-muted">
            Click &ldquo;Generate&rdquo; to create a YouTube clickbait thumbnail prompt
          </p>
        </div>
      )}
    </div>
  );
}
