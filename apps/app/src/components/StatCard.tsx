interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  accent,
  loading,
}: StatCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 flex flex-col gap-1">
      <span className="text-text-secondary text-xs font-medium uppercase tracking-widest">
        {label}
      </span>
      {loading ? (
        <>
          <div className="h-8 w-24 bg-surface-elevated rounded-md animate-pulse mt-1" />
          <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse mt-1" />
        </>
      ) : (
        <>
          <span
            className={`text-3xl font-bold tabular-nums leading-none mt-1 ${
              accent ? 'text-accent-red' : 'text-text-primary'
            }`}
          >
            {value}
          </span>
          {sub && <span className="text-text-muted text-xs mt-1">{sub}</span>}
        </>
      )}
    </div>
  );
}
