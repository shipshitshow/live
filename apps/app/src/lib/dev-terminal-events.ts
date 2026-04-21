'use client';

import type { TrendItem } from '@shipshitshow/types';

export interface TerminalPromptEventDetail {
  prompt: string;
}

declare global {
  interface WindowEventMap {
    'shipshitshow:terminal-prompt': CustomEvent<TerminalPromptEventDetail>;
  }
}

export function dispatchTerminalPrompt(prompt: string) {
  window.dispatchEvent(
    new CustomEvent('shipshitshow:terminal-prompt', { detail: { prompt } }),
  );
}

export function dispatchTrendPrompt(trend: TrendItem) {
  const prompt = [
    'Research this trend for Ship Shit Show and turn it into livestream prep.',
    `Title: ${trend.title}`,
    `Source: ${trend.source}`,
    `URL: ${trend.url}`,
    trend.summary ? `Summary: ${trend.summary}` : null,
    '',
    'Return:',
    '- why it matters now',
    '- 5 sharper related angles',
    '- livestream talking points',
    '- one contrarian hot take',
    '- a strong title/hook for the segment',
  ]
    .filter(Boolean)
    .join('\n');

  dispatchTerminalPrompt(prompt);
}
