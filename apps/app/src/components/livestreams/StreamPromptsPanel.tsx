import { getStreamPromptSections } from '@/lib/livestream-sections';
import { type LivestreamCard, MarkdownBody } from '@/lib/livestreams-ui';

export function StreamPromptsPanel({ cards }: { cards: LivestreamCard[] }) {
  const sections = getStreamPromptSections(cards);

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-base text-text-muted">
        No demo prompts have been added for this livestream yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <article
          key={`${section.title}-${section.body.slice(0, 40)}`}
          className="overflow-hidden rounded-xl border border-surface-border bg-surface-card"
        >
          <h3 className="sticky top-0 z-10 border-b border-surface-border bg-surface-card px-6 py-3 text-sm font-semibold uppercase tracking-widest text-text-muted">
            {section.title}
          </h3>
          <div className="p-6">
            <MarkdownBody body={section.body} large />
          </div>
        </article>
      ))}
    </div>
  );
}
