import { History } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Shown when the Past view has no bookings inside the active window. */
export function PastEmptyState({ days }: { days: number }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted ring-1 ring-inset ring-line">
        <History className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold text-ink">No past appointments</h2>
      <p className="max-w-sm text-sm text-muted">
        Nothing was seen or cancelled in the last {days} days. Try widening the window
        below.
      </p>
    </Card>
  );
}
