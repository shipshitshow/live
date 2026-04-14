import type { TrendItem } from "@/lib/trends-types";

const AI_PATTERNS = [
  /\bai\b/i,
  /artificial intelligence/i,
  /\bllm\b/i,
  /machine learning/i,
  /\bml\b/i,
  /\bgpt\b/i,
  /chatgpt/i,
  /claude/i,
  /anthropic/i,
  /openai/i,
  /gemini/i,
  /copilot/i,
  /cursor/i,
  /codex/i,
  /llama/i,
  /mistral/i,
  /qwen/i,
  /deepseek/i,
  /stable diffusion/i,
  /diffusion/i,
  /agentic/i,
  /prompt/i,
  /inference/i,
  /fine[- ]tune/i,
  /\brag\b/i,
  /vector embedding/i,
  /vibe cod/i,
];

export function isAIRelevant(item: TrendItem): boolean {
  const haystack = [item.title, item.summary, item.url].filter(Boolean).join(" ");
  return AI_PATTERNS.some((pattern) => pattern.test(haystack));
}
