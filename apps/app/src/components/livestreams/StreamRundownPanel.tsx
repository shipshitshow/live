import { getStreamSegmentSections } from '@/lib/livestream-sections';
import { type LivestreamCard, MarkdownBody } from '@/lib/livestreams-ui';

export function StreamRundownPanel({ cards }: { cards: LivestreamCard[] }) {
  const segments = getStreamSegmentSections(cards);

  if (segments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-base text-text-muted">
        No talking points have been selected for this livestream yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {segments.map((segment) => (
        <article
          key={`${segment.eyebrow ?? ''}-${segment.title}`}
          className="overflow-hidden rounded-xl border border-surface-border bg-surface-card"
        >
          <header className="sticky top-0 z-10 border-b border-surface-border bg-surface-card px-6 py-4">
            {segment.eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-red">
                {segment.eyebrow}
              </p>
            ) : null}
            <h3 className="mt-1 text-lg font-semibold text-text-primary">
              {segment.title}
            </h3>
          </header>
          <div className="p-6">
            <MarkdownBody body={segment.body} large />
          </div>
        </article>
      ))}
    </div>
  );
}
