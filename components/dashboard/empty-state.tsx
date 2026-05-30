import { Card } from "@/components/ui/card";
import { ToothLogo } from "./tooth-logo";

/** Shown when there are zero bookings in the window. */
export function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <ToothLogo size="lg" />
      <h2 className="text-lg font-semibold text-ink">
        The clinic schedule is clear
      </h2>
      <p className="max-w-sm text-sm text-muted">
        No voice agent appointments booked for this window. New bookings will appear
        here automatically as patients call in.
      </p>
    </Card>
  );
}
