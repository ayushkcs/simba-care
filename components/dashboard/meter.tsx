
export function Meter({
  value,
  max,
  caption,
}: {
  value: number;
  max: number;
  caption?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{caption}</span>
        <span className="font-semibold tabular-nums text-ink">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--warm-2)] to-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** A two-segment bar showing confirmed vs. cancelled share of the window. */
export function SplitBar({
  confirmed,
  cancelled,
}: {
  confirmed: number;
  cancelled: number;
}) {
  const total = confirmed + cancelled;
  const confirmedW = total > 0 ? (confirmed / total) * 100 : 100;
  const cancelledW = total > 0 ? (cancelled / total) * 100 : 0;

  return (
    <div className="mt-4">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-emerald-500/80" style={{ width: `${confirmedW}%` }} />
        <div className="h-full bg-rose-400/80" style={{ width: `${cancelledW}%` }} />
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {confirmed} Confirmed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          {cancelled} Cancelled
        </span>
      </div>
    </div>
  );
}
