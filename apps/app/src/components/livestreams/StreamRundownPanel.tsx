import {
  isUsefulSection,
  type LivestreamCard,
  MarkdownBody,
  parseSections,
} from '@/lib/livestreams-ui';

export function StreamRundownPanel({ cards }: { cards: LivestreamCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-base text-text-muted">
        No talking points have been selected for this livestream yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cards.map(({ topic }) => {
        const sections = parseSections(topic.content).filter((section) =>
          isUsefulSection(section.title),
        );

        return sections.map((section) => (
          <article
            key={`${topic.slug}-${section.title}`}
            className="rounded-xl border border-surface-border bg-surface-card p-6"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-muted">
              {section.title}
            </h3>
            <MarkdownBody body={section.body} large />
          </article>
        ));
      })}
    </div>
  );
}
