'use client';

import type {
  Lead,
  LeadEpisodeOption,
  LeadResponse,
  LeadSource,
} from '@shipshitshow/types';
import {
  isErrorResponse,
  LEAD_SOURCES,
  UNATTRIBUTED_EPISODE,
} from '@shipshitshow/types';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@shipshitshow/ui';
import { type FormEvent, useState } from 'react';
import { todayLocalDate } from '@/lib/date';
import { SOURCE_LABELS } from './lead-labels';

const FIELD_LABEL_CLASS =
  'text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted';

interface LeadQuickFormProps {
  episodes: LeadEpisodeOption[];
  onCreated: (lead: Lead) => void;
}

function episodeLabel(episode: LeadEpisodeOption): string {
  return episode.title ? `${episode.date} · ${episode.title}` : episode.date;
}

export function LeadQuickForm({ episodes, onCreated }: LeadQuickFormProps) {
  const [date, setDate] = useState(() => todayLocalDate());
  const [source, setSource] = useState<LeadSource>('linkedin');
  const [episodeDate, setEpisodeDate] = useState(
    () => episodes[0]?.date ?? UNATTRIBUTED_EPISODE,
  );
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/leads', {
        body: JSON.stringify({
          company,
          date,
          episodeDate:
            episodeDate === UNATTRIBUTED_EPISODE ? null : episodeDate,
          name,
          note,
          source,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload: unknown = await res.json();
      if (!res.ok) {
        throw new Error(
          isErrorResponse(payload) ? payload.error : 'Failed to save lead',
        );
      }

      onCreated((payload as LeadResponse).lead);
      // Date, source and episode stay put so a burst of inbounds from the same
      // episode is one field of typing each.
      setName('');
      setCompany('');
      setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-surface-border bg-surface-card p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex w-32 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Date</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <div className="flex w-36 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Source</span>
          <Select
            value={source}
            onValueChange={(value) => setSource(value as LeadSource)}
          >
            <SelectTrigger aria-label="Source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((value) => (
                <SelectItem key={value} value={value}>
                  {SOURCE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-64 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Episode</span>
          <Select value={episodeDate} onValueChange={setEpisodeDate}>
            <SelectTrigger aria-label="Episode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNATTRIBUTED_EPISODE}>Unknown</SelectItem>
              {episodes.map((episode) => (
                <SelectItem key={episode.date} value={episode.date}>
                  {episodeLabel(episode)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex min-w-40 flex-1 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Contact</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
          />
        </label>

        <label className="flex min-w-40 flex-1 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Company</span>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className={FIELD_LABEL_CLASS}>Note</span>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What they asked about"
            className="min-h-10 h-10 py-2"
          />
        </label>
        <Button type="submit" variant="accent" disabled={saving}>
          {saving ? 'Saving…' : 'Log lead'}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-accent-red">{error}</p>}
    </form>
  );
}
