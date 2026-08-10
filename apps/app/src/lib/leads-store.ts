import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  Lead,
  LeadEpisodeOption,
  LeadInput,
  LeadUpdate,
} from '@shipshitshow/types';
import {
  isLeadSource,
  isLeadStatus,
  UNATTRIBUTED_EPISODE,
} from '@shipshitshow/types';
import {
  createWritableStorageError,
  isBlobPersistenceEnabled,
  isReadOnlyVercelRuntime,
  listAllBlobs,
  putBlobJson,
  readBlobJson,
} from '@/lib/blob-storage';
import {
  listAvailableLivestreamDates,
  listLivestreamHistory,
} from '@/lib/livestreams-store';

const LEADS_DIR =
  process.env.LEADS_DIR || path.join(process.cwd(), 'data', 'leads');
const BLOB_LEADS_PREFIX = 'leads/entries';

function getLeadFilePath(id: string): string {
  return path.join(LEADS_DIR, `${id}.json`);
}

function getBlobLeadPath(id: string): string {
  return `${BLOB_LEADS_PREFIX}/${id}.json`;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

function parseLead(value: unknown): Lead | null {
  if (typeof value !== 'object' || value === null) return null;

  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    !isIsoDate(raw.date) ||
    !isLeadSource(raw.source) ||
    !isLeadStatus(raw.status)
  ) {
    return null;
  }

  const createdAt =
    typeof raw.createdAt === 'string' ? raw.createdAt : `${raw.date}T00:00:00Z`;

  return {
    company: optionalText(raw.company),
    createdAt,
    date: raw.date,
    episodeDate: isIsoDate(raw.episodeDate) ? raw.episodeDate : null,
    id: raw.id,
    name: optionalText(raw.name),
    note: optionalText(raw.note),
    source: raw.source,
    status: raw.status,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : createdAt,
  };
}

/**
 * Validates an untrusted request body. Only `date` and `source` are required —
 * everything else is optional so logging an inbound stays a few keystrokes.
 */
export function parseLeadInput(value: unknown): LeadInput | null {
  if (typeof value !== 'object' || value === null) return null;

  const raw = value as Record<string, unknown>;
  if (!isIsoDate(raw.date) || !isLeadSource(raw.source)) return null;

  return {
    company: optionalText(raw.company),
    date: raw.date,
    episodeDate: isIsoDate(raw.episodeDate) ? raw.episodeDate : null,
    name: optionalText(raw.name),
    note: optionalText(raw.note),
    source: raw.source,
    status: isLeadStatus(raw.status) ? raw.status : 'new',
  };
}

function listFilesystemLeads(): Lead[] {
  if (!fs.existsSync(LEADS_DIR)) return [];

  const leads: Lead[] = [];
  for (const fileName of fs.readdirSync(LEADS_DIR)) {
    if (!fileName.endsWith('.json')) continue;

    try {
      const raw = fs.readFileSync(path.join(LEADS_DIR, fileName), 'utf-8');
      const lead = parseLead(JSON.parse(raw));
      if (lead) leads.push(lead);
    } catch {
      // A malformed entry must not take the whole log down.
    }
  }

  return leads;
}

async function listBlobLeads(): Promise<Lead[]> {
  const blobs = await listAllBlobs(`${BLOB_LEADS_PREFIX}/`);
  const leads = await Promise.all(
    blobs.map(async ({ pathname }) => {
      const result = await readBlobJson<unknown>(pathname);
      return result ? parseLead(result.data) : null;
    }),
  );

  return leads.filter((lead): lead is Lead => lead !== null);
}

async function writeLead(lead: Lead): Promise<void> {
  if (!isBlobPersistenceEnabled()) {
    fs.mkdirSync(LEADS_DIR, { recursive: true });
    fs.writeFileSync(
      getLeadFilePath(lead.id),
      `${JSON.stringify(lead, null, 2)}\n`,
      'utf-8',
    );
    return;
  }

  await putBlobJson(getBlobLeadPath(lead.id), lead);
}

export async function listLeads(): Promise<Lead[]> {
  const merged = new Map<string, Lead>();

  for (const lead of listFilesystemLeads()) {
    merged.set(lead.id, lead);
  }
  for (const lead of await listBlobLeads()) {
    merged.set(lead.id, lead);
  }

  return Array.from(merged.values()).sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export async function createLead(input: LeadInput): Promise<Lead> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError('lead');
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    company: input.company ?? null,
    createdAt: now,
    date: input.date,
    episodeDate: input.episodeDate ?? null,
    id: randomUUID(),
    name: input.name ?? null,
    note: input.note ?? null,
    source: input.source,
    status: input.status ?? 'new',
    updatedAt: now,
  };

  await writeLead(lead);
  return lead;
}

export async function updateLead(
  id: string,
  updates: LeadUpdate,
): Promise<Lead | null> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError('lead');
  }

  const existing = (await listLeads()).find((lead) => lead.id === id) ?? null;
  if (!existing) return null;

  const next: Lead = {
    ...existing,
    status: updates.status,
    updatedAt: new Date().toISOString(),
  };

  await writeLead(next);
  return next;
}

/**
 * Leads keyed by attributed episode date, with unattributed inbounds under
 * `UNATTRIBUTED_EPISODE`. This is the per-episode rollup's lead column.
 */
export function countLeadsByEpisode(leads: Lead[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const lead of leads) {
    const key = lead.episodeDate ?? UNATTRIBUTED_EPISODE;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

/**
 * Stream dates an inbound can be attributed to: every published livestream plus
 * any date that already has topics (so a just-aired episode is selectable
 * before its transcript lands).
 */
export async function listLeadEpisodeOptions(): Promise<LeadEpisodeOption[]> {
  const titles = new Map<string, string>();
  for (const item of await listLivestreamHistory()) {
    titles.set(item.date, item.title);
  }

  const dates = new Set<string>([
    ...titles.keys(),
    ...(await listAvailableLivestreamDates()),
  ]);

  return Array.from(dates)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, title: titles.get(date) ?? null }));
}
