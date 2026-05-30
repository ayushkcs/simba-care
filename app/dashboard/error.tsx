"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

/** Route-level error boundary for the dashboard. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-600/20">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="text-lg font-semibold text-ink">Couldn&apos;t load the schedule</h1>
      <p className="max-w-sm text-sm text-muted">
        Something went wrong reaching the scheduling service. This is usually
        temporary.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
