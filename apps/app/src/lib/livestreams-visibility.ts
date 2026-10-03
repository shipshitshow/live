import type { Topic } from '@shipshitshow/types';
import { todayLocalDate } from '@/lib/date';

export function isPastDate(date: string): boolean {
  return date < todayLocalDate();
}

/**
 * Public visibility contract for livestream topics: past dates expose
 * everything except drafts and backlog, current and upcoming dates expose only
 * topics selected for the show. Every anonymous read must go through this.
 */
export function getVisibleTopics(topics: Topic[], date: string): Topic[] {
  if (isPastDate(date)) {
    return topics.filter(
      (topic) => topic.status !== 'backlog' && topic.status !== 'draft',
    );
  }
  return topics.filter((topic) => topic.status === 'in_progress');
}
