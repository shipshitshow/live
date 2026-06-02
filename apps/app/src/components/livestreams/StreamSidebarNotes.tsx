import { getSidebarNotes } from '@/lib/livestream-sections';
import { type LivestreamCard, MarkdownBody } from '@/lib/livestreams-ui';

export function StreamSidebarNotes({ cards }: { cards: LivestreamCard[] }) {
  const notes = getSidebarNotes(cards);
  if (notes.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
      <div className="border-b border-surface-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Sidebar Notes
        </p>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
        {notes.map((note) => (
          <section
            key={`${note.title}-${note.body.slice(0, 40)}`}
            className="space-y-2 border-b border-surface-border pb-4 last:border-b-0 last:pb-0"
          >
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              {note.title}
            </h3>
            <MarkdownBody body={note.body} />
          </section>
        ))}
      </div>
    </div>
  );
}
