'use client';

import type {
  EpisodeLinkedInMeasurement,
  EpisodeUtmClicks,
  LinkedInAuthor,
  LinkedInPostEntry,
} from '@shipshitshow/types';
import { LINKEDIN_AUTHORS, UTM_MEDIUM } from '@shipshitshow/types';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shipshitshow/ui';
import { useId, useState } from 'react';
import { CopyButton } from '@/components/CopyButton';
import { StatCard } from '@/components/StatCard';
import { parseJsonResponse } from '@/lib/parse-json-response';
import { buildUtmUrl } from '@/lib/utm';

/**
 * Per-episode LinkedIn distribution measurement (issue #20).
 *
 * The two halves are labelled differently on purpose: click-through is read
 * from PostHog, post metrics are copied off LinkedIn by hand because there is
 * no personal-profile analytics API. Nothing here fills a gap with a zero —
 * unrecorded metrics render as "not recorded" and an unmeasured campaign says
 * why it is unmeasured.
 */

const AUTHOR_LABELS: Record<LinkedInAuthor, string> = {
  mitchell: 'Mitchell',
  vincent: 'Vincent',
};

const METRIC_FIELDS = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'comments', label: 'Comments' },
] as const;

type MetricKey = (typeof METRIC_FIELDS)[number]['key'];

const CLICK_STATUS_MESSAGES: Record<
  Exclude<EpisodeUtmClicks['status'], 'ok'>,
  string
> = {
  error: 'PostHog could not be reached, so click-through is unknown.',
  no_campaign:
    'This episode has no episode number in its prep notes, so no campaign was minted and there is nothing to attribute clicks to.',
  not_configured:
    'PostHog is not configured (POSTHOG_API_KEY, POSTHOG_PROJECT_ID), so click-through is not tracked.',
};

function createDraftPost(): LinkedInPostEntry {
  return {
    author: 'vincent',
    id: crypto.randomUUID(),
    metrics: { comments: null, impressions: null, reactions: null },
    metricsProvenance: 'manual',
    metricsRecordedAt: null,
    postUrl: '',
    publishedOn: null,
  };
}

/** Empty means "not recorded" — it must never round-trip through zero. */
function toMetricValue(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function formatRecordedAt(value: string | null): string {
  if (!value) return 'Not recorded yet';
  return `Recorded ${new Date(value).toLocaleString()}`;
}

function UtmClicks({ clicks }: { clicks: EpisodeUtmClicks }) {
  if (clicks.status !== 'ok' || !clicks.clicks) {
    const message =
      clicks.status === 'ok'
        ? 'PostHog returned no click counts, so click-through is unknown.'
        : CLICK_STATUS_MESSAGES[clicks.status];

    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-5 text-sm text-text-muted">
        <p>{message}</p>
        {clicks.error && (
          <p className="mt-2 text-xs text-accent-red">{clicks.error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        accent
        label="LinkedIn clicks"
        sub="utm_source=linkedin"
        value={clicks.clicks.linkedin.toLocaleString()}
      />
      <StatCard
        label="X clicks"
        sub="utm_source=x"
        value={clicks.clicks.x.toLocaleString()}
      />
      <StatCard
        label="Campaign total"
        sub="PostHog pageviews"
        value={clicks.clicks.total.toLocaleString()}
      />
    </div>
  );
}

function TaggedLinkBuilder({ campaign }: { campaign: string }) {
  const inputId = useId();
  const [url, setUrl] = useState('');

  const linkedinUrl = buildUtmUrl(url, { campaign, source: 'linkedin' });
  const xUrl = buildUtmUrl(url, { campaign, source: 'x' });

  return (
    <div className="space-y-3">
      <label
        className="block text-xs font-medium uppercase tracking-widest text-text-muted"
        htmlFor={inputId}
      >
        Tag a link for this episode
      </label>
      <Input
        id={inputId}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://show.shipshit.dev/..."
        value={url}
      />
      {url.trim() && !linkedinUrl && (
        <p className="text-xs text-accent-red">
          Enter an absolute http(s) URL to tag it.
        </p>
      )}
      {linkedinUrl && xUrl && (
        <div className="space-y-2">
          {[
            { label: 'LinkedIn', value: linkedinUrl },
            { label: 'X', value: xUrl },
          ].map((entry) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-card px-3 py-2"
              key={entry.label}
            >
              <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-widest text-text-muted">
                {entry.label}
              </span>
              <code className="min-w-0 flex-1 truncate text-xs text-text-secondary">
                {entry.value}
              </code>
              <CopyButton text={entry.value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LinkedInMeasurementPanel({
  measurement,
}: {
  measurement: EpisodeLinkedInMeasurement;
}) {
  const [posts, setPosts] = useState<LinkedInPostEntry[]>(measurement.posts);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function updatePost(id: string, patch: Partial<LinkedInPostEntry>) {
    setPosts((previous) =>
      previous.map((post) => (post.id === id ? { ...post, ...patch } : post)),
    );
  }

  function updateMetric(id: string, key: MetricKey, raw: string) {
    setPosts((previous) =>
      previous.map((post) =>
        post.id === id
          ? { ...post, metrics: { ...post.metrics, [key]: toMetricValue(raw) } }
          : post,
      ),
    );
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/distribution/${encodeURIComponent(measurement.date)}/linkedin`,
        {
          body: JSON.stringify({ posts }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PUT',
        },
      );

      const payload = await parseJsonResponse<{
        error?: string;
        posts?: LinkedInPostEntry[];
      }>(response);

      if (!response.ok || !payload.posts) {
        setError(payload.error ?? 'Failed to save LinkedIn metrics');
        return;
      }

      setPosts(payload.posts);
      setSavedAt(new Date().toLocaleTimeString());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Campaign
          </h2>
          {measurement.campaign ? (
            <div className="flex items-center gap-2">
              <code className="rounded bg-surface-elevated px-2 py-1 text-xs text-text-secondary">
                utm_campaign={measurement.campaign}
              </code>
              <CopyButton text={measurement.campaign} />
            </div>
          ) : (
            <span className="text-xs text-text-muted">No campaign</span>
          )}
        </header>

        {measurement.campaign ? (
          <>
            <p className="text-sm text-text-muted">
              Every link published for episode #{measurement.episodeNumber}
              {' carries '}
              <code className="text-text-secondary">
                utm_medium={UTM_MEDIUM}
              </code>
              {' and the campaign above. The campaign identifies the episode, '}
              {'so LinkedIn and X share it and differ only by '}
              <code className="text-text-secondary">utm_source</code>.
            </p>
            <TaggedLinkBuilder campaign={measurement.campaign} />
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Add{' '}
            <code className="text-text-secondary">
              - Episode number: **#NN**
            </code>{' '}
            to this episode&apos;s prep notes to mint a campaign.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
          Click-through
        </h2>
        <UtmClicks clicks={measurement.utmClicks} />
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
              Post metrics
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              LinkedIn has no analytics API for personal profiles, so these are
              read off the post and typed in. Leave a field blank when you have
              not recorded it — blank means unknown, not zero.
            </p>
          </div>
          <Button
            onClick={() =>
              setPosts((previous) => [...previous, createDraftPost()])
            }
            variant="default"
          >
            Add post
          </Button>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-sm text-text-muted">
            No LinkedIn posts recorded for this episode yet.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                className="space-y-4 rounded-xl border border-surface-border bg-surface-card p-5"
                key={post.id}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    onValueChange={(value) =>
                      updatePost(post.id, { author: value as LinkedInAuthor })
                    }
                    value={post.author}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Author" />
                    </SelectTrigger>
                    <SelectContent>
                      {LINKEDIN_AUTHORS.map((author) => (
                        <SelectItem key={author} value={author}>
                          {AUTHOR_LABELS[author]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    aria-label="LinkedIn post URL"
                    className="min-w-0 flex-1"
                    onChange={(event) =>
                      updatePost(post.id, { postUrl: event.target.value })
                    }
                    placeholder="https://www.linkedin.com/feed/update/..."
                    value={post.postUrl}
                  />
                  <Input
                    aria-label="Published on"
                    className="w-40"
                    onChange={(event) =>
                      updatePost(post.id, {
                        publishedOn: event.target.value || null,
                      })
                    }
                    type="date"
                    value={post.publishedOn ?? ''}
                  />
                  <Button
                    onClick={() =>
                      setPosts((previous) =>
                        previous.filter((entry) => entry.id !== post.id),
                      )
                    }
                    variant="danger"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {METRIC_FIELDS.map((field) => (
                    <label
                      className="space-y-1 text-xs font-medium uppercase tracking-widest text-text-muted"
                      key={field.key}
                    >
                      {field.label}
                      <Input
                        inputMode="numeric"
                        min={0}
                        onChange={(event) =>
                          updateMetric(post.id, field.key, event.target.value)
                        }
                        placeholder="Not recorded"
                        type="number"
                        value={post.metrics[field.key] ?? ''}
                      />
                    </label>
                  ))}
                </div>

                <footer className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="rounded bg-surface-elevated px-2 py-1 uppercase tracking-widest">
                    {post.metricsProvenance === 'manual'
                      ? 'Manual entry'
                      : 'API'}
                  </span>
                  <span>{formatRecordedAt(post.metricsRecordedAt)}</span>
                </footer>
              </article>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isSaving} onClick={handleSave} variant="accent">
            {isSaving ? 'Saving…' : 'Save metrics'}
          </Button>
          {error && <span className="text-xs text-accent-red">{error}</span>}
          {!error && savedAt && (
            <span className="text-xs text-text-muted">Saved at {savedAt}</span>
          )}
        </div>
      </section>
    </div>
  );
}
