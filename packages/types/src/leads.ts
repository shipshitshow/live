export type LeadSource = 'linkedin' | 'x' | 'youtube' | 'email' | 'other';

export const LEAD_SOURCES: LeadSource[] = [
  'linkedin',
  'x',
  'youtube',
  'email',
  'other',
];

export type LeadStatus = 'new' | 'replied' | 'call_booked' | 'won' | 'dead';

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'replied',
  'call_booked',
  'won',
  'dead',
];

/**
 * Bucket key for inbounds that cannot be traced back to a stream date. Never
 * collides with a real episode key, which is always a YYYY-MM-DD date.
 */
export const UNATTRIBUTED_EPISODE = 'unknown';

export interface Lead {
  id: string;
  /** Date the inbound arrived (YYYY-MM-DD). */
  date: string;
  source: LeadSource;
  /** Stream date this inbound is attributed to, null when unknown. */
  episodeDate: string | null;
  name: string | null;
  company: string | null;
  status: LeadStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadInput {
  date: string;
  source: LeadSource;
  episodeDate?: string | null;
  name?: string | null;
  company?: string | null;
  status?: LeadStatus;
  note?: string | null;
}

export interface LeadUpdate {
  status: LeadStatus;
}

export interface LeadEpisodeOption {
  date: string;
  title: string | null;
}

export interface LeadListResponse {
  leads: Lead[];
  episodes: LeadEpisodeOption[];
  /**
   * Lead counts keyed by episode date, plus `UNATTRIBUTED_EPISODE` for
   * inbounds with no attribution. Consumed by the per-episode rollup.
   */
  leadsByEpisode: Record<string, number>;
}

export interface LeadResponse {
  lead: Lead;
}

export function isLeadSource(value: unknown): value is LeadSource {
  return (
    typeof value === 'string' && LEAD_SOURCES.includes(value as LeadSource)
  );
}

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === 'string' && LEAD_STATUSES.includes(value as LeadStatus)
  );
}
