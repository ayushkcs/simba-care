import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function PastWindowExpander({
  days,
  nextDays,
  truncated,
}: {
  days: number;
  nextDays: number | null;
  truncated: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-2 text-center">
      <p className="text-xs text-muted">
        Showing the last {days} days
        {truncated && " · some older results may be hidden"}
      </p>
      {nextDays && (
        <Link
          href={`/dashboard?view=past&days=${nextDays}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
        >
          <ChevronDown className="h-4 w-4 text-muted" aria-hidden />
          Show last {nextDays} days
        </Link>
      )}
    </div>
  );
}
