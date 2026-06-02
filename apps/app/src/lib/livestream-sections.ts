import type { LivestreamCard, MarkdownSection } from '@/lib/livestreams-ui';
import { parseSections, parseSubSections } from '@/lib/livestreams-ui';

export interface SidebarNote {
  body: string;
  title: string;
}

export interface StreamResourceSection {
  body: string;
  title: string;
}

export interface StreamPromptSection {
  body: string;
  title: string;
}

export function isPromptSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized.includes('/goal') ||
    normalized.includes('copy paste') ||
    normalized.includes('goal prompt')
  );
}

export function isUtilityTalkingPointSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized.includes('thumbnail') ||
    normalized.includes('clip') ||
    isPromptSection(title)
  );
}

export function isTimelineSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized.startsWith('cold open') ||
    normalized.startsWith('close') ||
    normalized.startsWith('closing') ||
    normalized === 'hot take' ||
    (normalized.startsWith('talking points') &&
      !isUtilityTalkingPointSection(title))
  );
}

export function isTimelineSubSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return normalized === '' || normalized === 'talking points';
}

export function formatTimelineTitle(title: string): string {
  return title.replace(/^Talking Points\s+[—-]\s+/i, '');
}

function formatSegmentTitle(title: string, subTitle: string): string {
  const segment = formatTimelineTitle(title);
  return subTitle ? `${segment} · ${subTitle}` : segment;
}

function getTopicSections(card: LivestreamCard): MarkdownSection[] {
  return parseSections(card.topic.content);
}

export function getSidebarNotes(cards: LivestreamCard[]): SidebarNote[] {
  return cards.flatMap((card) =>
    getTopicSections(card).flatMap((section) => {
      if (
        section.title.toLowerCase().startsWith('talking points') &&
        !isUtilityTalkingPointSection(section.title)
      ) {
        return parseSubSections(section.body)
          .filter((sub) => !isTimelineSubSection(sub.title))
          .map((sub) => ({
            body: sub.body,
            title: formatSegmentTitle(section.title, sub.title),
          }));
      }

      return [];
    }),
  );
}

export function getStreamResourceSections(
  cards: LivestreamCard[],
): StreamResourceSection[] {
  return cards.flatMap((card) =>
    getTopicSections(card).flatMap((section) => {
      if (
        section.title.toLowerCase().startsWith('talking points') &&
        isUtilityTalkingPointSection(section.title)
      ) {
        if (isPromptSection(section.title)) return [];

        return [
          {
            body: section.body,
            title: formatTimelineTitle(section.title),
          },
        ];
      }

      if (isTimelineSection(section.title)) return [];

      return [{ body: section.body, title: section.title }];
    }),
  );
}

export function getStreamPromptSections(
  cards: LivestreamCard[],
): StreamPromptSection[] {
  return cards.flatMap((card) =>
    getTopicSections(card).flatMap((section) => {
      if (
        section.title.toLowerCase().startsWith('talking points') &&
        isPromptSection(section.title)
      ) {
        return [
          {
            body: section.body,
            title: formatTimelineTitle(section.title),
          },
        ];
      }

      return [];
    }),
  );
}
