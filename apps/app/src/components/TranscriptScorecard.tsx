import { formatNumber } from '@/lib/format';
import type { TranscriptScorecard as TranscriptScorecardData } from '@/lib/transcript-scorecard';

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-300';
  return 'text-accent-red';
}

export function TranscriptScorecard({
  scorecard,
}: {
  scorecard: TranscriptScorecardData | null;
}) {
  if (!scorecard) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
      <div className="border-b border-surface-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Transcript Rate Card
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold leading-none text-text-primary">
              {scorecard.overall}
              <span className="text-base text-text-muted">/10</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Grade {scorecard.grade}
            </p>
          </div>
          <div className="text-right text-[11px] leading-relaxed text-text-muted">
            <p>{formatNumber(scorecard.stats.wordCount)} words</p>
            <p>{scorecard.stats.estimatedMinutes} min est.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          {scorecard.items.map((item) => (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-text-secondary">
                  {item.label}
                </span>
                <span className={`font-semibold ${getScoreColor(item.score)}`}>
                  {item.score}/10
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-accent-red"
                  style={{ width: `${item.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 border-y border-surface-border py-3 text-[11px] text-text-muted">
          <div>
            <p className="text-text-secondary">Questions</p>
            <p>{scorecard.stats.questionCount}</p>
          </div>
          <div>
            <p className="text-text-secondary">Filler / 1K</p>
            <p>{scorecard.stats.fillerPerThousand}</p>
          </div>
          <div>
            <p className="text-text-secondary">Jargon / 1K</p>
            <p>{scorecard.stats.jargonPerThousand}</p>
          </div>
        </div>

        {scorecard.jargonFlags.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
              Say It Plainly
            </p>
            {scorecard.jargonFlags.map((flag) => (
              <p
                key={flag.term}
                className="text-xs leading-relaxed text-text-secondary"
              >
                <span className="font-medium text-accent-red">{flag.term}</span>
                {flag.examples[0] !== flag.term.toLowerCase() && (
                  <span className="text-text-muted">
                    {' '}
                    ({flag.examples.join(', ')})
                  </span>
                )}
                <span className="text-text-muted"> ×{flag.count}</span> →{' '}
                {flag.say}
              </p>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Best Reads
          </p>
          {scorecard.strengths.map((strength) => (
            <p
              key={strength}
              className="text-xs leading-relaxed text-text-secondary"
            >
              {strength}
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
            Tighten Next
          </p>
          {scorecard.improvements.map((improvement) => (
            <p
              key={improvement}
              className="text-xs leading-relaxed text-text-secondary"
            >
              {improvement}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
