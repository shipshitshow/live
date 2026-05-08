export function TranscriptPanel({
  title,
  transcript,
}: {
  title: string;
  transcript: string | null;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
          Transcript
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          {title}
        </h2>
      </div>

      {transcript ? (
        <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-xl border border-surface-border bg-surface-card p-5 text-sm leading-relaxed text-text-secondary">
          {transcript}
        </pre>
      ) : (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-sm text-text-muted">
          No clean transcript has been imported for this livestream yet.
        </div>
      )}
    </section>
  );
}
