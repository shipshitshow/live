import type { LeadSource, LeadStatus } from '@shipshitshow/types';

export const SOURCE_LABELS: Record<LeadSource, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  other: 'Other',
  x: 'X',
  youtube: 'YouTube',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  call_booked: 'Call booked',
  dead: 'Dead',
  new: 'New',
  replied: 'Replied',
  won: 'Won',
};

export const STATUS_STYLES: Record<LeadStatus, string> = {
  call_booked: 'text-accent-red',
  dead: 'text-text-muted',
  new: 'text-text-primary',
  replied: 'text-text-secondary',
  won: 'text-emerald-400',
};
